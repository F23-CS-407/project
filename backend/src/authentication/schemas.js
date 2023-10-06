import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password_hash: String,
  salt: String,
  description: String,
});

export const User = mongoose.model('User', userSchema);
