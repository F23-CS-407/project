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

  const thisUser = (await User.findById(id)).scrub();
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
    const thisUser = await User.findOne({ username: req.user.username });
    thisUser.bio = new_description;
    res.send((await thisUser.save()).scrub());
    return;
  }

  res.status(401).send({ error: 'not signed in' });
}

export async function changeUsername(req, res, next) {
  const new_username = req.body.new_username;
  // must be logged in
  if (req.isAuthenticated()) {
    // must have new_username
    if (!new_username) {
      res.status(400).send({ error: 'new_username missing' });
      return;
    }

    // check if username is taken
    if (await User.findOne({ username: new_username })) {
      res.status(409).send({ error: 'username taken' });
      return;
    }

    // save and return new user object
    const thisUser = await User.findOne({ username: req.user.username });
    thisUser.username = new_username;
    res.send((await thisUser.save()).scrub());
    return;
  }

  res.status(401).send({ error: 'not signed in' });
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
