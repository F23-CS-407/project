import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    password_hash: String,
});

export const User = mongoose.model('User', userSchema);
