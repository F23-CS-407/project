import { sha256 } from 'js-sha256';
import { User } from './schemas.js';
import crypto from 'crypto';
import { Community } from '../communities/schemas.js';

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

  // remove user from mod lists
  for (const community of user.mod_for) {
    const com = await Community.findById(community);
    com.mods = com.mods.filter((mod) => !mod.equals(user._id));
    await com.save();
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
