const Hackathon = require('../models/Hackathon');

/**
 * Automatically updates hackathon statuses based on current date:
 * - 'upcoming' -> 'ongoing' when current date >= startDate
 * - 'ongoing' -> 'ended' when current date >= endDate
 */
const updateHackathonStatuses = async () => {
  try {
    const now = new Date();

    // 1. Transition 'upcoming' -> 'ongoing'
    const upcomingToOngoingResult = await Hackathon.updateMany(
      {
        status: 'upcoming',
        startDate: { $lte: now },
      },
      {
        $set: { status: 'ongoing' },
      }
    );

    // 2. Transition 'ongoing' -> 'ended' when current time passes endDate
    // If no winner has been declared yet, resultStatus remains 'pending'
    const ongoingToEndedResult = await Hackathon.updateMany(
      {
        status: 'ongoing',
        endDate: { $lte: now },
      },
      [
        {
          $set: {
            status: 'ended',
            resultStatus: {
              $cond: {
                if: { $eq: ['$resultStatus', 'published'] },
                then: 'published',
                else: 'pending',
              },
            },
          },
        },
      ]
    );

    if (upcomingToOngoingResult.modifiedCount > 0) {
      console.log(`[Scheduler] Updated ${upcomingToOngoingResult.modifiedCount} hackathons from 'upcoming' to 'ongoing'`);
    }

    if (ongoingToEndedResult.modifiedCount > 0) {
      console.log(`[Scheduler] Updated ${ongoingToEndedResult.modifiedCount} hackathons from 'ongoing' to 'ended'`);
    }
  } catch (error) {
    console.error('[Scheduler Error] Failed to update hackathon statuses:', error.message);
  }
};

/**
 * Initializes periodic background task for lifecycle management
 * @param {number} intervalMs - Interval in milliseconds (default: 60 seconds)
 */
const startHackathonScheduler = (intervalMs = 60000) => {
  // Run once immediately on start
  updateHackathonStatuses();

  // Schedule background task
  const intervalId = setInterval(updateHackathonStatuses, intervalMs);
  return intervalId;
};

module.exports = {
  updateHackathonStatuses,
  startHackathonScheduler,
};
