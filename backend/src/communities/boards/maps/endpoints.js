import mongoose from 'mongoose';

import { Map } from './schemas';
import { User } from '../../../authentication/schemas';
import { Board } from '../schemas';

export async function createMap(req, res, next) {
  const parent = req.body.board;

  if (!parent) {
    res.status(400).send({ error: 'board missing' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(parent)) {
    res.status(404).send({ error: 'board not found' });
    return;
  }
  let board = await Board.findById(parent);
  if (!board) {
    res.status(404).send({ error: 'board not found' });
  }

  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }

  const new_map = new Map({
    parent: parent,
    image: undefined,
    posts: [],
  });
  await new_map.save();

  //add map to board
  board.child = new_map._id;
  await board.save();

  //return the map object
  res.status(200).send(new_map);
  return;
}

export async function addImage(req, res, next) {
  const mapId = req.body.map;
  const image = req.body.image;

  if (!mapId) {
    res.status(400).send({ error: 'map id missing' });
    return;
  }

  if (!image) {
    res.status(400).send({ error: 'image missing' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(mapId)) {
    res.status(404).send({ error: 'map not found' });
    return;
  }

  let map = await Map.findById(mapId);
  map.image = image;
  await map.save();

  res.status(200).send('Map image updated');
  return;
}

export async function getMapByBoard(req, res, next) {
  const boardId = req.query.board;

  if (!boardId) {
    res.status(400).send({ error: 'board missing' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    res.status(404).send({ error: 'board not found' });
  }

  const board = await Board.findById(boardId);
  const map = await Map.findById(board.child);
  res.status(200).json(map);
}
