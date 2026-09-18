import Hackathon from '../models/Hackathon.js';

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

    // 1. Any non-ended hackathon whose endDate has passed → ended + close registrations
    const toEndedResult = await Hackathon.updateMany(
      {
        status: { $ne: 'ended' },
        endDate: { $lte: now },
      },
      {
        $set: { status: 'ended', isRegistrationOpen: false },
      }
    );

    // 2. Transition upcoming → ongoing when startDate reached (and not yet ended)
    const toOngoingResult = await Hackathon.updateMany(
      {
        status: 'upcoming',
        startDate: { $lte: now },
        // Guard: don't flip if endDate is also past (handled above already)
        endDate: { $gt: now },
      },
      {
        $set: { status: 'ongoing' },
      }
    );

    // 3. Sync registrations based on registrationDeadline
    // 3a. Close registrations on hackathons whose registrationDeadline has passed
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

    // 3b. Re-open registrations on upcoming hackathons whose registrationDeadline is in the future
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

    // 4. Ensure ended hackathons have resultStatus set to 'pending' if not yet published
    await Hackathon.updateMany(
      {
        status: 'ended',
        resultStatus: { $nin: ['published', 'pending'] },
      },
      {
        $set: { resultStatus: 'pending' },
      }
    );

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
