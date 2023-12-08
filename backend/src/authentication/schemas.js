import mongoose from 'mongoose';
import { deleteAllUserData } from './utils.js';
import { Community } from '../communities/schemas.js';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: String,
    password_hash: String,
    bio: String,
    salt: String,
    description: String,
    mod_for: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    liked_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    followed_communities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
    uploads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadReceipt',
      },
    ],
    saved_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    profile_pic: String,
  },
  {
    methods: {
      // removes private and unnecesary information
      scrub() {
        this.password_hash = undefined;
        this.salt = undefined;

        return this;
      },

      // delete this object and all child components
      async deleteRecursive(cb) {
        return await deleteAllUserData(this.username, cb);
      },

      // follow a community by adding to User object and Community object
      async followCommunity(communityId) {
        // get User and Community
        let user = await User.findById(this._id);
        let community = await Community.findById(communityId);

        // put community in followed_communities
        if (user && !user.followed_communities.includes(communityId)) {
          user.followed_communities.push(communityId);
          await user.save();
        }

        // put user in community's followers list
        if (community && !community.followers.includes(user._id)) {
          community.followers.push(user._id);
          await community.save();
        }
      },

      // unfollow a community by removing from User object and Community object
      async unfollowCommunity(communityId) {
        // get User and Community
        let user = await User.findById(this._id);
        let community = await Community.findById(communityId);

        // remove community from followed_communities
        if (user && user.followed_communities.includes(communityId)) {
          user.followed_communities = user.followed_communities.filter((c) => !c.equals(communityId));
          await user.save();
        }

        // remove user from community's followers list
        if (community && community.followers.includes(user._id)) {
          community.followers = community.followers.filter((u) => !u.equals(user._id));
          await community.save();
        }
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
