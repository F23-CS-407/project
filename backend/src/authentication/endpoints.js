import passport from 'passport';

import { deleteAllUserData, hash, saltGen, verify } from './utils.js';
import { User } from './schemas.js';

// Create user, body must include username and password fields
export const createUser = async (req, res, next) => {
  const requested_username = req.body.username;
  const requested_password = req.body.password;

  // Must have username and password
  if (!requested_username || !requested_password) {
    res.status(400).send({ error: 'Username or password missing' });
    return;
  }

  // Check if already exists
  const users = await User.find({ username: requested_username });
  if (users.length > 0) {
    res.status(409).send({ error: 'Username taken' });
    return;
  }

  // Create user
  const salt = saltGen();
  const new_user = new User({
    username: requested_username,
    bio: 'Go to settings to change your bio!',
    password_hash: hash(requested_password + salt),
    salt,
  });
  await new_user.save();

  // Login
  login(req, res, next);
};

export function login(req, res, next) {
  // Authenticate user, on success send user object
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send({ error: 'Missing username or password' });
    return;
  }

  passport.authenticate('local', function (err, user) {
    req.logIn(user, function () {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(user ? 200 : 401).send(user ? user : { error: 'Login failed' });
      }
    });
  })(req, res, next);
}

export function logout(req, res, next) {
  // If logged in then destroy session
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.send({ confirmation: 'Logged out successfully' });
    });
    return;
  }
  res.status(401).send({ error: 'Not logged in' });
}

export async function deleteUser(req, res, next) {
  // must be authenticated
  if (req.isAuthenticated()) {
    const username = req.user.username;
    const password = req.body.password;

    // password must be sent
    if (!password) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }
    const returnResultCb = (err, res) => {
      return res;
    };

    // password must be correct
    if (await verify(username, password, returnResultCb)) {
      // delete user and all user related content
      await deleteAllUserData(username, returnResultCb);
      // logout
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.send({ confirmation: 'Deleted account' });
      });
      return;
    }
    res.status(401).send({ error: 'Password mismatch' });
    return;
  }
  res.status(401).send({ error: 'Not logged in' });
}

export async function get_user(req, res, next) {
  if (req.isAuthenticated()) {
    res.send((await User.findById(req.user._id)).scrub());
  } else {
    res.status(401).send({ error: 'Not logged in' });
  }

  return next();
}
