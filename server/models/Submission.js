const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
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
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    demoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    presentationFile: {
      type: String,
      default: '',
    },
    screenshots: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'submitted',
    },
    score: {
      type: Number,
      default: 0,
    },
    evaluations: [
      {
        judge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: {
          type: Number,
          required: true,
        },
        feedback: {
          type: String,
          default: '',
        },
        evaluatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient hackathon & participant queries
submissionSchema.index({ hackathon: 1, submittedBy: 1 });
submissionSchema.index({ hackathon: 1, team: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
