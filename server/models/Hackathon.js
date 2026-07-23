const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    tagline: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'ended', 'cancelled'],
      default: 'draft',
    },
    maxTeamSize: {
      type: Number,
      default: 4,
    },
    prizePool: {
      type: String,
      default: '$0',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    assignedJudges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isResultsPublished: {
      type: Boolean,
      default: false,
    },
    winners: [
      {
        rank: Number,
        submission: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Submission',
        },
        prize: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized search, filtering, and sorting
hackathonSchema.index({ title: 'text', tagline: 'text', description: 'text' });
hackathonSchema.index({ status: 1, createdAt: -1 });
hackathonSchema.index({ organizer: 1 });
hackathonSchema.index({ tags: 1 });
hackathonSchema.index({ startDate: 1 });

module.exports = mongoose.model('Hackathon', hackathonSchema);

