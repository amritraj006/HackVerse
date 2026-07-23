const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    joinCode: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized team queries, search, and member lookups
teamSchema.index({ name: 'text' });
teamSchema.index({ hackathon: 1, status: 1, createdAt: -1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ members: 1 });
teamSchema.index({ joinCode: 1 });

module.exports = mongoose.model('Team', teamSchema);

