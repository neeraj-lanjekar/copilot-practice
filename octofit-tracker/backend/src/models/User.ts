import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    displayName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export default model('User', userSchema);
