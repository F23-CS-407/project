import mongoose from 'mongoose';
import { User } from '../authentication/schemas.js';
import { Post } from './posts/schemas.js';
const { Schema } = mongoose;

const communitySchema = new Schema(
  {
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
  },
  {
    methods: {
      // remove mod from community's mod list and remove community from user's mod_for list
      async removeMod(modId) {
        // remove mod from community mod list
        let com = await Community.findById(this._id);
        if (com) {
          com.mods = com.mods.filter((mod) => !mod.equals(modId));
        }
        await com.save();

        // remove community from user mod_for list
        const user = await User.findById(modId);
        if (user) {
          user.mod_for = user.mod_for.filter((community) => !community.equals(com._id));
        }
        await user.save();

        // if community now has 0 mods, delete it
        com = await Community.findById(this._id);
        if (com && com.mods.length == 0) {
          await com.deleteRecursive();
        }
      },

      // remove all mods, delete all child content, delete community object
      async deleteRecursive() {
        const com = await Community.findById(this._id);

        // delete all posts
        for (const post of com.posts) {
          const post_obj = await Post.findById(post);
          if (post_obj) {
            await post_obj.deleteRecursive();
          }
        }

        // remove all mods
        for (const mod of com.mods) {
          await com.removeMod(mod);
        }

        // delete the object
        await com.delete();
      },
    },
  },
);

export const Community = mongoose.model('Community', communitySchema);
