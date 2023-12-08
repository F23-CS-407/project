import mongoose from 'mongoose';
const { Schema } = mongoose;
import { User } from '../../authentication/schemas.js';
import { Comment } from './comments/schemas.js';

//For now, there is just content of type string for the basic post implementation.

const postSchema = new Schema(
  {
    content: String,
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    created_date: Date,
    tags: [String],
    category: String,
    liked_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    parent_ref: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'parent_ref',
    },
    media: String,
  },
  {
    methods: {
      // add like to post object and save post in user's liked_posts list,
      // returns true if success or false if already like
      async addUserLike(userId) {
        const post = await Post.findById(this._id);

        const index = post.liked_by.indexOf(userId);
        if (index == -1) {
          // add to posts like list
          post.liked_by.push(userId);
          await post.save();

          // add post to user's liked_posts list
          let user = await User.findById(userId);
          if (user) {
            user.liked_posts.push(post._id);
            await user.save();
          }

          return true;
        }

        return false;
      },

      // remove like from post object and user's liked_posts list,
      // returns true if success or false if not already liked
      async removeUserLike(userId) {
        const post = await Post.findById(this._id);

        const index = post.liked_by.indexOf(userId);
        if (index !== -1) {
          post.liked_by.splice(index, 1);
          await post.save();

          // remove post from user's liked_posts list
          let user = await User.findById(userId);
          if (user) {
            user.liked_posts = user.liked_posts.filter((p) => !p.equals(post._id));
            await user.save();
          }

          return true;
        }

        return false;
      },

      // delete all comments, remove from user post list, remove from parent post list, delete object, delete likes
      async deleteRecursive() {
        let post = await Post.findById(this._id).populate('parent');

        // delete all comments
        for (const comment of post.comments) {
          let com = await Comment.findById(comment);
          if (com) {
            await com.deleteRecursive();
          }
        }

        // remove from user post list
        let user = await User.findById(this.created_by);
        if (user) {
          user.posts = user.posts.filter((p) => !p.equals(post._id));
          await user.save();
        }

        // remove from parent post list
        let parent = post.parent;
        if (parent) {
          parent.posts = parent.posts.filter((p) => !p.equals(post._id));
          await parent.save();
        }

        // delete likes from users who have liked
        for (const liker of post.liked_by) {
          await post.removeUserLike(liker);
        }

        // delete the post
        await post.delete();
      },
    },
  },
);

export const Post = mongoose.model('Post', postSchema);
