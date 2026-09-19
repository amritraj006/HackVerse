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

export default {
  getEffectiveStatus,
  isHackathonEnded,
  isRegistrationEffectivelyOpen,
};
