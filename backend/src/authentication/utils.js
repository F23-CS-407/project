import { sha256 } from 'js-sha256';
import { User } from './schemas.js';
import crypto from 'crypto';
import { Community } from '../communities/schemas.js';
import { Comment } from '../communities/posts/comments/schemas.js';
import { Post } from '../communities/posts/schemas.js';

/* 
Takes a username, a password, and a callback function
returns the result of a the call callback
if error: return cb(err)
if password fail: return cb(null, false)
if password matches: return cb(null, user object) 
*/
export async function verify(username, password, cb) {
  // if username not found, verify fail
  const users = await User.find({ username: username });
  if (users.length != 1) {
    return cb(null, false);
  }
  const user = users[0];

  // if password matches, give user, otherwise fail
  if (user.password_hash == hash(password + user.salt)) {
    return cb(null, user);
  } else {
    return cb(null, false);
  }
}

// delete all user data, posts, comments, etc. cb
export async function deleteAllUserData(username, cb) {
  // if username not found, error
  const user = await User.findOne({ username: username });
  if (!user) {
    return cb('user not found', false);
  }

  // unfollow all communities
  for (const community of user.followed_communities) {
    await user.unfollowCommunity(community);
  }

  // delete user's comments
  for (const comment of user.comments) {
    const com = await Comment.findById(comment);
    if (com) {
      await com.deleteRecursive();
    }
  }

  // remove user's likes
  for (const post of user.liked_posts) {
    const post_obj = await Post.findById(post);
    if (post_obj) {
      await post_obj.removeUserLike(user._id);
    }
  }

  // delete user's posts
  for (const post of user.posts) {
    const post_obj = await Post.findById(post);
    if (post_obj) {
      await post_obj.deleteRecursive();
    }
  }

  // remove user from mod lists
  for (const community of user.mod_for) {
    const com = await Community.findById(community);
    if (com) {
      await com.removeMod(user._id);
    }
  }

  // delete user object
  await user.delete();

  return cb(null, true);
}

export function hash(content) {
  return sha256(content);
}

export function saltGen() {
  return crypto.randomBytes(16).toString('hex');
}

export function serializeUser(user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
}

export function deserializeUser(user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
}
