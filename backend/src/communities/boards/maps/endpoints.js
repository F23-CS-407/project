import mongoose from 'mongoose';

import { Map } from './schemas.js';
import { User } from '../../../authentication/schemas.js';
import { Board } from '../schemas.js';
import { UploadReceipt } from '../../../uploads/schema.js';

export async function createMap(req, res, next) {
  const parent = req.body.board;
  const image = req.body.image;

  if (!parent) {
    res.status(400).send({ error: 'board missing' });
    return;
  }

  if (!image) {
    res.status(400).send({ error: 'image not found' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(parent)) {
    res.status(404).send({ error: 'board not found' });
    return;
  }

  let board = await Board.findById(parent);
  if (!board) {
    res.status(404).send({ error: 'board not found' });
    return;
  }

  let imageReceipt = new UploadReceipt({
    file: image,
  });
  await imageReceipt.save();

  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }

  const new_map = new Map({
    parent: parent,
    image: imageReceipt,
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
  //Probably won't be used this sprint now.
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

  if (!mongoose.Types.ObjectId.isValid(image)) {
    res.status(404).send({ error: 'image receipt not found ' });
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
  const map = await Map.findById(board.child).populate('image');
  res.status(200).json(map);
}
