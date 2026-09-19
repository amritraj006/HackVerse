/**
 * Centralized hackathon lifecycle utility.
 *
 * Lifecycle:
 *   upcoming        → before startDate (submission window open date)
 *   ongoing         → startDate <= now < endDate  (registrations may be open or closed)
 *   ended           → now >= endDate
 *
 * Database `status` field is periodically synced by the scheduler,
 * but these helpers let any code compute the *effective* state in real time
 * without waiting for the next scheduler tick.
 */

/**
 * Compute the effective lifecycle status of a hackathon based on dates.
 * Always prefer the date-based computation over the stored `status` field.
 *
 * @param {Object} hackathon  - Mongoose document or plain object
 * @param {Date}   [now]      - Injection point for testability (default: new Date())
 * @returns {'upcoming'|'ongoing'|'ended'}
 */
export const getEffectiveStatus = (hackathon, now = new Date()) => {
  if (!hackathon) return 'upcoming';

  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
  const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;

  // Past the submission deadline → always ENDED
  if (endDate && now >= endDate) return 'ended';

  // Past the start (submissions open) but before deadline → ONGOING
  if (startDate && now >= startDate) return 'ongoing';

  // Before start → UPCOMING
  return 'upcoming';
};

/**
 * Returns true when a hackathon's submission deadline has passed.
 * This is the primary guard for all mutation restrictions.
 *
 * @param {Object} hackathon
 * @param {Date}   [now]
 * @returns {boolean}
 */
export const isHackathonEnded = (hackathon, now = new Date()) => {
  if (!hackathon) return false;

  // If endDate is defined, compute strictly from the submission deadline
  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
  if (endDate) {
    return now >= endDate;
  }

  // Fallback if no endDate is present
  return hackathon.status === 'ended';
};

/**
 * Returns true when a hackathon's registration window is open for new participants.
 *
 * @param {Object} hackathon
 * @param {Date}   [now]
 * @returns {boolean}
 */
export const isRegistrationEffectivelyOpen = (hackathon, now = new Date()) => {
  if (!hackathon) return false;
  if (isHackathonEnded(hackathon, now)) return false;

  const registrationDeadline = hackathon.registrationDeadline
    ? new Date(hackathon.registrationDeadline)
    : null;

  if (registrationDeadline && now > registrationDeadline) return false;

  // If hackathon is not ended and registration deadline is in the future,
  // registration is open (even if DB isRegistrationOpen was stale from a past deadline).
  if (hackathon.isRegistrationOpen === false) {
    if (registrationDeadline && now <= registrationDeadline) {
      return true;
    }
    return false;
  }

  return true;
};

export const WINNER_DECLARATION_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Returns the winner declaration window state for a hackathon.
 *
 * @param {Object} hackathon
 * @param {Date}   [now]
 * @returns {{
 *   isEnded: boolean,
 *   endDate: Date|null,
 *   judgeDeadline: Date|null,
 *   isWithinJudgeWindow: boolean,
 *   isJudgeWindowExpired: boolean,
 *   remainingWindowMs: number
 * }}
 */
export const getWinnerDeclarationState = (hackathon, now = new Date()) => {
  if (!hackathon) {
    return {
      isEnded: false,
      endDate: null,
      judgeDeadline: null,
      isWithinJudgeWindow: false,
      isJudgeWindowExpired: false,
      remainingWindowMs: 0,
    };
  }

  const isEnded = isHackathonEnded(hackathon, now);
  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
  const judgeDeadline = endDate
    ? new Date(endDate.getTime() + WINNER_DECLARATION_WINDOW_MS)
    : null;

  const isWithinJudgeWindow = Boolean(isEnded && judgeDeadline && now <= judgeDeadline);
  const isJudgeWindowExpired = Boolean(isEnded && judgeDeadline && now > judgeDeadline);
  const remainingWindowMs = judgeDeadline ? Math.max(0, judgeDeadline.getTime() - now.getTime()) : 0;

  return {
    isEnded,
    endDate,
    judgeDeadline,
    isWithinJudgeWindow,
    isJudgeWindowExpired,
    remainingWindowMs,
  };
};

/**
 * Checks and records any assigned judges who failed to declare a winner within 12 hours.
 * Safe to call idempotently.
 *
 * @param {Object|string} hackathonOrId
 * @param {Date} [now]
 * @returns {Promise<Object|null>}
 */
export const recordMissedJudgeDeadlines = async (hackathonOrId, now = new Date()) => {
  try {
    const Hackathon = (await import('../models/Hackathon.js')).default;
    const Submission = (await import('../models/Submission.js')).default;
    const User = (await import('../models/User.js')).default;
    const Notification = (await import('../models/Notification.js')).default;

    let hackathon = hackathonOrId;
    if (!hackathon || !hackathon._id || typeof hackathon.save !== 'function') {
      hackathon = await Hackathon.findById(hackathonOrId?._id || hackathonOrId);
    }

    if (!hackathon) return null;

    const { isJudgeWindowExpired } = getWinnerDeclarationState(hackathon, now);
    if (!isJudgeWindowExpired) {
      return hackathon;
    }

    // Check if a winner has already been declared
    const winnerExists = await Submission.exists({
      hackathon: hackathon._id,
      isWinner: true,
    });

    if (winnerExists) {
      return hackathon;
    }

    // If no judge assigned, nothing to record
    if (!hackathon.assignedJudges || hackathon.assignedJudges.length === 0) {
      return hackathon;
    }

    let modified = false;
    const missedSet = new Set(
      (hackathon.missedJudgeDeadlines || []).map((m) =>
        (m.judge?._id || m.judge || m).toString()
      )
    );
    const reassignedSet = new Set(
      (hackathon.reassignedJudges || []).map((rj) =>
        (rj._id || rj).toString()
      )
    );

    for (const judgeId of hackathon.assignedJudges) {
      const jIdStr = (judgeId._id || judgeId).toString();
      if (!missedSet.has(jIdStr) && !reassignedSet.has(jIdStr)) {
        if (!hackathon.missedJudgeDeadlines) {
          hackathon.missedJudgeDeadlines = [];
        }
        hackathon.missedJudgeDeadlines.push({
          judge: judgeId._id || judgeId,
          missedAt: now,
        });
        missedSet.add(jIdStr);
        modified = true;

        // Record on User account without imposing artificial penalties
        await User.updateOne(
          {
            _id: judgeId._id || judgeId,
            'missedWinnerDeadlines.hackathon': { $ne: hackathon._id },
          },
          {
            $push: {
              missedWinnerDeadlines: {
                hackathon: hackathon._id,
                missedAt: now,
              },
            },
          }
        );

        // Fetch judge details for notification
        const judgeUser = await User.findById(judgeId).select('name email');

        // Notify organizer that judge missed deadline
        const organizerId = hackathon.organizer?._id || hackathon.organizer;
        if (organizerId) {
          const alreadyNotified = await Notification.exists({
            user: organizerId,
            hackathon: hackathon._id,
            type: 'hackathon',
            title: { $regex: /Missed Winner Declaration Deadline/i },
          });

          if (!alreadyNotified) {
            await Notification.create({
              user: organizerId,
              sender: judgeId._id || judgeId,
              type: 'hackathon',
              title: 'Judge Missed Winner Declaration Deadline',
              message: `The assigned judge (${judgeUser?.name || 'Assigned Judge'}) failed to declare a winner for "${hackathon.title}" within the required 12-hour period after the hackathon ended. You can now declare the winner or assign someone else to handle winner declaration.`,
              hackathon: hackathon._id,
              status: 'read',
            });
          }
        }
      }
    }

    if (modified) {
      await hackathon.save();
    }

    return hackathon;
  } catch (error) {
    console.error('[recordMissedJudgeDeadlines error]:', error.message);
    return null;
  }
};

export default {
  WINNER_DECLARATION_WINDOW_MS,
  getEffectiveStatus,
  isHackathonEnded,
  isRegistrationEffectivelyOpen,
  getWinnerDeclarationState,
  recordMissedJudgeDeadlines,
};

