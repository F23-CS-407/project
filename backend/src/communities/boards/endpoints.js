import mongoose from 'mongoose';

import { Community } from '../schemas.js';
import { Board } from './schemas.js';
import { User } from '../../authentication/schemas.js';
import { Post } from '../posts/schemas.js';

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

export async function getBoard(req, res, next) {
  const id = req.query.id;

  // must have id
  if (!id) {
    res.status(400).send({ error: 'id missing' });
    return;
  }

  // id must be valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'board not found' });
    return;
  }
  let board = await Board.findById(id);
  if (!board) {
    res.status(404).send({ error: 'board not found' });
    return;
  }

  // send the board
  res.status(200).send(board);
}

export async function getCommunityBoards(req, res, next) {
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
  let com = await Community.findById(id).populate('boards');
  if (!com) {
    res.status(404).send({ error: 'community not found' });
    return;
  }

  //send the boards
  res.status(200).send(com.boards);
}

export async function postInBoard(req, res) {
  const post = req.body.post;
  const post_board = req.body.board;

  const created_date = Date.now();

  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'Not logged in' });
    return;
  }

  const post_user = req.user._id;

  if (!post) {
    res.status(400).send({ error: 'No post data' });
    return;
  }

  if (!post.content) {
    res.status(400).send({ error: 'There is no content in the post' });
    return;
  }

  if (!post_board) {
    res.status(400).send({ error: 'A post must exist in a board' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(post_board)) {
    res.status(400).send({ error: 'Invalid board ID' });
    return;
  }

  if (!post_user) {
    res.status(400).send({ error: 'A user must make a post' });
    return;
  }

  const new_post = new Post({
    content: post.content,
    created_by: post_user,
    created_date: created_date,
    tags: post.tags,
    liked_by: [],
    comments: [],
    parent: post_board,
    parent_ref: 'Board',
  });

  //Creates new post in database
  const posted = await new_post.save();

  //Updates the board with the new post ID.
  const board = await Board.findOne({ _id: post_board });
  board.posts.push(posted._id);
  await board.save();

  //Updates the user with new post ID
  const user = await User.findById(post_user);
  if (user) {
    user.posts.push(posted._id);
    await user.save();
  }

  res.status(200).json(posted);
}
