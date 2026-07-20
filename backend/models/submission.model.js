const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  projectDescription: {
    type: String,
    required: [true, 'Project description is required'],
  },
  repositoryUrl: {
    type: String,
    required: [true, 'Repository URL is required'],
    trim: true,
  },
  demoUrl: {
    type: String,
    default: '',
    trim: true,
  },
  presentationPdf: {
    type: String,
    default: '',
  },
  screenshots: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Ensure a team can only submit one project per hackathon
submissionSchema.index({ hackathon: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
