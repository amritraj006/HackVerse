const mongoose = require('mongoose');
const { HACKATHON_STATUS } = require('../constants/roles');

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  requirements: {
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
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  mode: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online',
  },
  location: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    required: [true, 'Theme / Category is required'],
  },
  status: {
    type: String,
    enum: Object.values(HACKATHON_STATUS),
    default: HACKATHON_STATUS.UPCOMING,
  },
  maxTeamSize: {
    type: Number,
    default: 4,
    min: 1,
  },
  minTeamSize: {
    type: Number,
    default: 1,
    min: 1,
  },
  bannerImage: {
    type: String,
    default: '',
  },
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
