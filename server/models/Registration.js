const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique registration per participant per hackathon
registrationSchema.index({ hackathon: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
