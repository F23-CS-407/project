import { sha256 } from 'js-sha256';
import { User } from './schemas.js';

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
  if (user.password_hash == hash(password)) {
    return cb(null, user);
  } else {
    return cb(null, false);
  }
}

export function hash(content) {
  return sha256(content);
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
