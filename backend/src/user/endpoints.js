import { User } from '../authentication/schemas.js';
import mongoose from 'mongoose';
import { Community } from '../communities/schemas.js';
import { verify, hash, saltGen } from '../authentication/utils.js';

export async function getUser(req, res, next) {
  const id = req.query.id;
  if (!id) {
    res.status(400).send({ error: 'id param missing' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'Invalid user id' });
    return;
  }

  const thisUser = (await User.findById(id).populate('profile_pic')).scrub();
  res.status(200).json(thisUser);
}

export async function changeDescription(req, res, next) {
  const new_description = req.body.new_description;
  // must be logged in
  if (req.isAuthenticated()) {
    // must have new_username
    if (!new_description) {
      res.status(400).send({ error: 'new_description missing' });
      return;
    }

    // save and return new user object
    const thisUser = await User.findOne({ username: req.user.username }).populate('profile_pic');
    thisUser.bio = new_description;
    res.send((await thisUser.save()).scrub());
    return;
  }

  res.status(401).send({ error: 'not signed in' });
}

export async function changeUsername(req, res, next) {
  const new_username = req.body.new_username;
  if (req.isAuthenticated()) {
    if (!new_username) {
      res.status(400).send({ error: 'new_username missing' });
      return;
    }

    if (await User.findOne({ username: new_username })) {
      res.status(409).send({ error: 'username taken' });
      return;
    }

    if (!req.user || !req.user.username) {
      res.status(400).send({ error: 'Current username not found in session' });
      return;
    }

    const thisUser = await User.findOne({ username: req.user.username });
    if (!thisUser) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    thisUser.username = new_username;
    try {
      let updatedUser = await thisUser.save();
      updatedUser = await User.findById(updatedUser._id).populate('profile_pic');
      // Update the username in the session and save the session
      req.user.username = new_username;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          res.status(500).send({ error: 'Error updating session' });
          return;
        }
        res.send(updatedUser.scrub());
      });
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).send({ error: 'Error updating username' });
    }
  } else {
    res.status(401).send({ error: 'not signed in' });
  }
}

export async function followCommunity(req, res, next) {
  const id = req.body.id;

  // must have id
  if (!id) {
    res.status(400).send({ error: 'id missing' });
    return;
  }

  // id must be valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'community not found' });
    return;
  }
  let community = await Community.findById(id);
  if (!community) {
    res.status(404).send({ error: 'community not found' });
    return;
  }

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  let user = await User.findById(req.user._id);

  // must not already be following
  if (user.followed_communities.includes(id)) {
    res.status(409).send({ error: 'already following community' });
    return;
  }

  // follow
  await user.followCommunity(id);

  // return community object
  community = await Community.findById(id);
  res.status(200).json(community);
}

export async function unfollowCommunity(req, res, next) {
  const id = req.body.id;

  // must have id
  if (!id) {
    res.status(400).send({ error: 'id missing' });
    return;
  }

  // id must be valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'community not found' });
    return;
  }
  let community = await Community.findById(id);
  if (!community) {
    res.status(404).send({ error: 'community not found' });
    return;
  }

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  let user = await User.findById(req.user._id);

  // must already be following
  if (!user.followed_communities.includes(id)) {
    res.status(409).send({ error: 'not following community' });
    return;
  }

  // follow
  await user.unfollowCommunity(id);

  // return community object
  community = await Community.findById(id);
  res.status(200).json(community);
}

export async function isFollowingCommunity(req, res, next) {
  const id = req.query.id;

  // must have id
  if (!id) {
    res.status(400).send({ error: 'id missing' });
    return;
  }

  // id must be valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'community not found' });
    return;
  }
  let community = await Community.findById(id);
  if (!community) {
    res.status(404).send({ error: 'community not found' });
    return;
  }

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  let user = await User.findById(req.user._id);

  // return true if following or false if not
  let isFollowing = user.followed_communities.includes(id);
  res.status(200).send(isFollowing);
}

export async function getFollowedCommunities(req, res, next) {
  let user_id = req.query.id;

  // must have user id
  if (!user_id) {
    res.status(400).send({ error: 'missing user id' });
    return;
  }

  // must be valid
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    res.status(404).send({ error: 'user not found' });
    return;
  }
  let user = await User.findById(user_id).populate('followed_communities');
  if (!user) {
    res.status(404).send({ error: 'user not found' });
    return;
  }

  // return community objects
  res.status(200).send(user.followed_communities);
  return;
}

export async function changePassword(req, res, next) {
  const old_password = req.body.old_password;
  const new_password = req.body.new_password;

  // must be logged in
  if (req.isAuthenticated()) {
    let thisUser = await User.findById(req.user._id);

    // must have new_password
    if (!new_password) {
      res.status(400).send({ error: 'new_password missing' });
      return;
    }

    // must have old_password
    if (!old_password) {
      res.status(400).send({ error: 'old_password missing' });
      return;
    }

    const returnResultCb = (err, res) => {
      return res;
    };

    // old_password must be correct
    if (await verify(thisUser.username, old_password, returnResultCb)) {
      // generate new salt and password hash
      const salt = saltGen();
      thisUser.password_hash = hash(new_password + salt);
      thisUser.salt = salt;

      thisUser = (await thisUser.save()).scrub();
      res.status(200).json(thisUser);
      return;
    } else {
      res.status(401).send({ error: 'Password mismatch' });
      return;
    }
  }

  res.status(401).send({ error: 'not signed in' });
}

export async function getUploadedFiles(req, res) {
  const id = req.query.id;

  // must have user id
  if (!id) {
    res.status(400).send({ error: 'id missing' });
    return;
  }

  // user must be valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'user not found' });
    return;
  }
  let user = await User.findById(id).populate('uploads');
  if (!user) {
    res.status(404).send({ error: 'user not found' });
    return;
  }

  // send an array of UploadReceipts
  res.send(user.uploads);
}
