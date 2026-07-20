require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Hackathon = require('./models/hackathon.model');
const Review = require('./models/review.model');
const Submission = require('./models/submission.model');
const reviewService = require('./services/review.service');

const runVerify = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackverse';
    await mongoose.connect(mongoUri);
    console.log('Verify: Connected to DB.');

    // 1. Check User counts
    const usersCount = await User.countDocuments();
    console.log(`Assertion 1 (Total Users): ${usersCount} (Expected: 14)`);

    // 2. Check Hackathon statuses
    const hackUpcoming = await Hackathon.findOne({ status: 'upcoming' });
    const hackOngoing = await Hackathon.findOne({ status: 'ongoing' });
    const hackCompleted = await Hackathon.findOne({ status: 'completed' });
    console.log(`Assertion 2 (Hackathons States):`);
    console.log(`- Upcoming hackathon exists: ${!!hackUpcoming}`);
    console.log(`- Ongoing hackathon exists: ${!!hackOngoing}`);
    console.log(`- Completed hackathon exists: ${!!hackCompleted}`);

    // 3. Test Leaderboard Calculation Aggregation
    if (hackCompleted) {
      const leaderboard = await reviewService.getLeaderboard(hackCompleted._id);
      console.log(`Assertion 3 (Fintech Leaderboard Average Scores):`);
      leaderboard.forEach((item, idx) => {
        console.log(`- [Rank ${idx + 1}] Team: "${item.team?.name}", Project: "${item.projectName}", Score: ${item.averageScore.toFixed(2)} (${item.reviewCount} review(s))`);
      });
    }

    await mongoose.connection.close();
    console.log('Verify: Successfully completed validation queries.');
  } catch (error) {
    console.error('Verify validation error:', error);
    process.exit(1);
  }
};

runVerify();
