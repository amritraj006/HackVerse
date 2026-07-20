const mongoose = require('mongoose');
const { REGISTRATION_STATUS } = require('../constants/roles');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(REGISTRATION_STATUS),
    default: REGISTRATION_STATUS.REGISTERED,
  },
}, {
  timestamps: true,
});

// Avoid duplicate registrations per user per hackathon
registrationSchema.index({ user: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
