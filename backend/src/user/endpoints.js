import { User } from '../authentication/schemas.js';
import mongoose from 'mongoose';

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
    thisUser.description = new_description;
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
