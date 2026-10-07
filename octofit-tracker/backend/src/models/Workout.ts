import { Schema, model } from 'mongoose';

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

export default model('Workout', workoutSchema);
