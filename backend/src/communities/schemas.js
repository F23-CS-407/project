import mongoose from 'mongoose';
const { Schema } = mongoose;

const communitySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: String,
  mods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

export const Community = mongoose.model('Community', communitySchema);
