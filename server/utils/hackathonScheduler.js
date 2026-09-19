import Hackathon from '../models/Hackathon.js';
import Notification from '../models/Notification.js';
import Registration from '../models/Registration.js';
import {
  WINNER_DECLARATION_WINDOW_MS,
  recordMissedJudgeDeadlines,
} from './hackathonLifecycle.js';

/**
 * Sends a lifecycle notification to all active registrants of a hackathon.
 * Idempotent: skips if a notification with the same title already exists for the hackathon.
 */
const broadcastLifecycleNotification = async (hackathon, type, title, message) => {
  try {
    // Idempotency guard — only send once per lifecycle transition per hackathon
    const alreadySent = await Notification.exists({ hackathon: hackathon._id, type, title });
    if (alreadySent) return;

    const registrations = await Registration.find({ hackathon: hackathon._id, status: 'active' }).select('participant');
    if (registrations.length === 0) return;

    const notifs = registrations.map((r) => ({
      user: r.participant,
      type,
      title,
      message,
      hackathon: hackathon._id,
      status: 'pending',
    }));

    await Notification.insertMany(notifs, { ordered: false });
    console.log(`[Scheduler] Sent "${title}" notification to ${notifs.length} participant(s) for "${hackathon.title}"`);
  } catch (err) {
    console.error(`[Scheduler] Failed to broadcast lifecycle notification for "${hackathon.title}":`, err.message);
  }
};

/**
 * Periodically syncs hackathon `status` and `isRegistrationOpen` in the DB
 * so queries can filter by indexed fields efficiently.
 *
 * Lifecycle transitions:
 *   upcoming  → ongoing   when now >= startDate
 *   *         → ended     when now >= endDate  (catches any state that slipped through)
 *   ended     → close     isRegistrationOpen = false
 */
export const updateHackathonStatuses = async () => {
  try {
    const now = new Date();

    // ── 1. Transition → ended when submission deadline passed ─────────────────
    // Fetch affected hackathons BEFORE the update so we can notify their participants
    const toEndedHackathons = await Hackathon.find({
      status: { $ne: 'ended' },
      endDate: { $lte: now },
    }).select('_id title');

    const toEndedResult = await Hackathon.updateMany(
      {
        status: { $ne: 'ended' },
        endDate: { $lte: now },
      },
      {
        $set: { status: 'ended', isRegistrationOpen: false },
      }
    );

    // Send hackathon_ended notifications
    for (const h of toEndedHackathons) {
      await broadcastLifecycleNotification(
        h,
        'hackathon_ended',
        `⏰ Hackathon Ended: ${h.title}`,
        `"${h.title}" has ended and submissions are now closed. Results will be published soon. Thank you for participating!`
      );
    }

    // ── 2. Transition upcoming → ongoing when startDate reached ───────────────
    const toOngoingHackathons = await Hackathon.find({
      status: 'upcoming',
      startDate: { $lte: now },
      endDate: { $gt: now },
    }).select('_id title');

    const toOngoingResult = await Hackathon.updateMany(
      {
        status: 'upcoming',
        startDate: { $lte: now },
        endDate: { $gt: now },
      },
      {
        $set: { status: 'ongoing' },
      }
    );

    // Send hackathon_started notifications
    for (const h of toOngoingHackathons) {
      await broadcastLifecycleNotification(
        h,
        'hackathon_started',
        `🚀 Hackathon Started: ${h.title}`,
        `"${h.title}" has officially started! Log in, form your team, and start building. Good luck! 💪`
      );
    }

    // 2b. Transition ended → ongoing if submission deadline was extended into the future
    await Hackathon.updateMany(
      {
        status: 'ended',
        startDate: { $lte: now },
        endDate: { $gt: now },
      },
      {
        $set: { status: 'ongoing' },
      }
    );

    // 2c. Transition ended → upcoming if startDate is also still in the future
    await Hackathon.updateMany(
      {
        status: 'ended',
        startDate: { $gt: now },
        endDate: { $gt: now },
      },
      {
        $set: { status: 'upcoming' },
      }
    );

    // ── 3. Sync registrations based on registrationDeadline ──────────────────
    // 3a. Close registrations when deadline has passed
    const toRegClosedHackathons = await Hackathon.find({
      status: { $ne: 'ended' },
      isRegistrationOpen: true,
      registrationDeadline: { $lte: now },
    }).select('_id title');

    await Hackathon.updateMany(
      {
        status: { $ne: 'ended' },
        isRegistrationOpen: true,
        registrationDeadline: { $lte: now },
      },
      {
        $set: { isRegistrationOpen: false },
      }
    );

    // Send registration_closed notifications
    for (const h of toRegClosedHackathons) {
      await broadcastLifecycleNotification(
        h,
        'registration_closed',
        `🔒 Registration Closed: ${h.title}`,
        `Registration for "${h.title}" is now closed. The hackathon is still ongoing — registered participants can continue to submit their projects until the submission deadline.`
      );
    }

    // 3b. Re-open registrations on upcoming hackathons whose deadline is in the future
    await Hackathon.updateMany(
      {
        status: 'upcoming',
        isRegistrationOpen: false,
        registrationDeadline: { $gt: now },
      },
      {
        $set: { isRegistrationOpen: true },
      }
    );

    // ── 4. Ensure ended hackathons have resultStatus = 'pending' if unpublished ─
    await Hackathon.updateMany(
      {
        status: 'ended',
        resultStatus: { $nin: ['published', 'pending'] },
      },
      {
        $set: { resultStatus: 'pending' },
      }
    );

    // ── 5. Record missed winner declaration deadlines ──────────────────────────
    const twelveHoursAgo = new Date(now.getTime() - WINNER_DECLARATION_WINDOW_MS);
    const expiredHackathons = await Hackathon.find({
      status: 'ended',
      endDate: { $lte: twelveHoursAgo },
      'assignedJudges.0': { $exists: true },
    });

    for (const h of expiredHackathons) {
      await recordMissedJudgeDeadlines(h, now);
    }

    if (toEndedResult.modifiedCount > 0) {
      console.log(`[Scheduler] Ended ${toEndedResult.modifiedCount} hackathon(s) past their submission deadline`);
    }
    if (toOngoingResult.modifiedCount > 0) {
      console.log(`[Scheduler] Transitioned ${toOngoingResult.modifiedCount} hackathon(s) from 'upcoming' to 'ongoing'`);
    }
  } catch (error) {
    console.error('[Scheduler Error] Failed to update hackathon statuses:', error.message);
  }
};

/**
 * Starts the background scheduler.
 * Runs immediately on boot, then on the specified interval.
 *
 * @param {number} intervalMs - Poll interval in milliseconds (default: 60s)
 * @returns {NodeJS.Timeout}
 */
export const startHackathonScheduler = (intervalMs = 60_000) => {
  updateHackathonStatuses();
  return setInterval(updateHackathonStatuses, intervalMs);
};

export default { updateHackathonStatuses, startHackathonScheduler };
