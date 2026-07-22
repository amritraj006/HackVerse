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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);
