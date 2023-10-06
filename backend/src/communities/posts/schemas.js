import mongoose from 'mongoose';
const { Schema } = mongoose;

//For now, there is just content of type string for the basic post implementation.

const postSchema = new Schema({
    content: String,
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_date: Date,
    tags: [String],
    liked_by: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
  });
  
  export const Post = mongoose.model('Post', postSchema);
