import mongoose from 'mongoose';
import { Post } from '../posts/schemas.js';
import { Community } from '../schemas.js';
const { Schema } = mongoose;

const boardSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
    },
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Map',
    },
  },
  {
    methods: {
      // remove all posts, remove from community, delete object
      async deleteRecursive() {
        const board = await Board.findById(this._id);

        // delete all posts
        for (const post of board.posts) {
          const post_obj = await Post.findById(post);
          if (post_obj) {
            await post_obj.deleteRecursive();
          }
        }

        // remove from community
        const com = await Community.findById(board.parent);
        if (com) {
          com.boards = com.boards.filter((b) => !b.equals(board._id));
          await com.save();
        }

        // delete the object
        await board.delete();
      },
    },
  },
);

export const Board = mongoose.model('Board', boardSchema);
