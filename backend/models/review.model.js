const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scores: {
    innovation: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    technicalComplexity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    design: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    presentation: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
  },
  totalScore: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Calculate totalScore before saving
reviewSchema.pre('save', function (next) {
  const { innovation, technicalComplexity, design, presentation } = this.scores;
  this.totalScore = (innovation + technicalComplexity + design + presentation) / 4;
  next();
});

// Ensure a judge can only review a submission once
reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
