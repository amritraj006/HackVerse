/**
 * Frontend hackathon lifecycle helpers.
 * Mirrors the logic in server/utils/hackathonLifecycle.js.
 *
 * Use these to derive display status from hackathon date fields — never
 * trust the stored `status` string alone for UI display decisions.
 */

/**
 * Compute effective hackathon status from dates.
 * @param {Object} hackathon
 * @param {Date} [now]
 * @returns {'upcoming'|'ongoing'|'ended'}
 */
export const getEffectiveStatus = (hackathon, now = new Date()) => {
  if (!hackathon) return 'upcoming';

  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
  const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;

  if (endDate && now >= endDate) return 'ended';
  if (startDate && now >= startDate) return 'ongoing';
  return 'upcoming';
};

/**
 * Returns true when the hackathon's submission deadline has passed.
 * @param {Object} hackathon
 * @param {Date} [now]
 * @returns {boolean}
 */
export const isHackathonEnded = (hackathon, now = new Date()) => {
  if (!hackathon) return false;
  const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;
  if (endDate) {
    return now >= endDate;
  }
  return hackathon.status === 'ended';
};

/**
 * Returns true when registration is effectively open.
 * @param {Object} hackathon
 * @param {Date} [now]
 * @returns {boolean}
 */
export const isRegistrationEffectivelyOpen = (hackathon, now = new Date()) => {
  if (!hackathon) return false;
  if (isHackathonEnded(hackathon, now)) return false;
  const regDeadline = hackathon.registrationDeadline
    ? new Date(hackathon.registrationDeadline)
    : null;
  if (regDeadline && now > regDeadline) return false;

  // If hackathon is not ended and registration deadline is in the future,
  // registration is open (even if DB isRegistrationOpen was stale from a past deadline).
  if (hackathon.isRegistrationOpen === false) {
    if (regDeadline && now <= regDeadline) {
      return true;
    }
    return false;
  }

  return true;
};

/**
 * Map an effective status to the CSS badge classes used throughout the app.
 */
export const STATUS_BADGE_CLASS = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended:    'bg-slate-100 text-slate-600 border-slate-200',
  draft:    'bg-amber-50 text-amber-700 border-amber-200',
};

/**
 * Human-readable label for each status.
 */
export const STATUS_LABEL = {
  upcoming: 'Upcoming',
  ongoing:  'Live',
  ended:    'Ended',
  draft:    'Draft',
};
