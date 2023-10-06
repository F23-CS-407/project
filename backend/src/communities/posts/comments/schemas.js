import mongoose from 'mongoose';
const { Schema } = mongoose;

//Similarly to posts, only has content of type string for now.
const commentSchema = new Schema({
  content: String,
  children_comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_date: Date,
});

export const Comment = mongoose.model('Comment', commentSchema);
