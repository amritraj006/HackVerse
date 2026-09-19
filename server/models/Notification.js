import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'team_invite',
        'team_removed',
        'system',
        'hackathon',
        'judge_invite',
        'winner',             // sent to winning participants when winner is declared / results published
        'hackathon_started',  // broadcast when hackathon transitions upcoming → ongoing
        'hackathon_ended',    // broadcast when hackathon transitions → ended
        'registration_closed', // broadcast when registration deadline passes
      ],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'read'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query of user notifications
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
