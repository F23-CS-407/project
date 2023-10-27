import mongoose from 'mongoose';

import { Community } from '../schemas.js';
import { Board } from './schemas.js';
import { User } from '../../authentication/schemas.js';

export async function createBoard(req, res, next) {
  const name = req.body.name;
  const communityId = req.body.community;

  // must have a name
  if (!name) {
    res.status(400).send({ error: 'name missing' });
    return;
  }

  // must have a community id
  if (!communityId) {
    res.status(400).send({ error: 'community missing' });
    return;
  }

  // community must be valid
  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    res.status(404).send({ error: 'community not found' });
    return;
  }
  let community = await Community.findById(communityId).populate('boards');
  if (!community) {
    res.status(404).send({ error: 'community not found' });
    return;
  }

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  const user = await User.findById(req.user._id);

  // must be a mod in the community
  if (!community.mods.includes(user._id)) {
    res.status(403).send({ error: 'not mod in community' });
    return;
  }

  // board name must not be used in community already
  if (!community.boards.every((b) => b.name != name)) {
    res.status(409).send({ error: 'board name in use' });
    return;
  }

  // create board
  const new_board = new Board({
    name: name,
    parent: community._id,
    posts: [],
  });
  await new_board.save();

  // add board to community
  community.boards.push(new_board._id);
  await community.save();

  // return the board object
  res.status(200).send(new_board);
  return;
}

export async function deleteBoard(req, res, next) {
  const boardId = req.body.board;

  // must have a board id
  if (!boardId) {
    res.status(400).send({ error: 'board missing' });
    return;
  }

  // board must be valid
  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    res.status(404).send({ error: 'board not found' });
    return;
  }
  let board = await Board.findById(boardId);
  if (!board) {
    res.status(404).send({ error: 'board not found' });
    return;
  }
  let community = await Community.findById(board.parent);

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  const user = await User.findById(req.user._id);

  // must be a mod in the community
  if (!community.mods.includes(user._id)) {
    res.status(403).send({ error: 'not mod in community' });
    return;
  }

  // remove board from community
  community.boards = community.boards.filter((b) => !b.equals(board._id));
  await community.save();

  // delete the board
  await board.deleteRecursive();

  res.status(200).send('Deleted');
  return;
}
