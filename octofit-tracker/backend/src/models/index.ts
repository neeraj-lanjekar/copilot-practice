import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    displayName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: '' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['run', 'walk', 'cycle', 'swim', 'strength', 'other'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, min: 0, default: 0 },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'recovery'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  { timestamps: true },
);

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

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
export const Team = mongoose.models.Team ?? mongoose.model('Team', teamSchema);
export const Activity =
  mongoose.models.Activity ?? mongoose.model('Activity', activitySchema);
export const Workout =
  mongoose.models.Workout ?? mongoose.model('Workout', workoutSchema);
export const Leaderboard =
  mongoose.models.Leaderboard ??
  mongoose.model('Leaderboard', leaderboardSchema);
