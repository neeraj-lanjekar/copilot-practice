import { Schema, model } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'all-time'],
      required: true,
    },
    points: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);
leaderboardSchema.index({ user: 1, team: 1, period: 1 }, { unique: true });

export default model('Leaderboard', leaderboardSchema);
