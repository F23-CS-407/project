import { User } from '../authentication/schemas.js';
import { UploadReceipt } from './schema.js';
import { upload } from './utils.js';
import { Community } from '../communities/schemas.js';
import mongoose from 'mongoose';

const uploadBaseUrl = '/api/upload/';

export async function uploadFile(req, res) {
  // must be a request type that can send files
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ error: 'content-type must be multipart/form-data' });
    return;
  }

  // must be logged in
  if (req.isAuthenticated()) {
    // save the file
    upload.single('file')(req, res, async (err) => {
      // file couldn't be fetched from request
      if (err) {
        res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
        return;
      }

      // get the file info and generate a receipt
      const file = req.file;
      let receipt = new UploadReceipt({
        creator: req.user._id,
        filename: file.filename,
        url: uploadBaseUrl + file.filename,
      });
      receipt = await receipt.save();

      // put receipt in user profile
      let user = await User.findById(req.user._id);
      user.uploads.push(receipt._id);
      await user.save();
      res.send(receipt);

      return;
    });
    return;
  }
  res.status(401).send({ error: 'not logged in' });
  return;
}

export async function setProfilePic(req, res) {
  // must be a request type that can send files
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ error: 'content-type must be multipart/form-data' });
    return;
  }

  // must be logged in
  if (req.isAuthenticated()) {
    // save the file
    upload.single('file')(req, res, async (err) => {
      // file couldn't be fetched from request
      if (err) {
        res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
        return;
      }

      // get the file info and generate a receipt
      const file = req.file;
      let receipt = new UploadReceipt({
        creator: req.user._id,
        filename: file.filename,
        url: uploadBaseUrl + file.filename,
      });
      receipt = await receipt.save();

      let user = await User.findById(req.user._id).populate('profile_pic');

      // put receipt in user profile and profile pic
      user.uploads.push(receipt._id);
      user.profile_pic = receipt.url;

      // send new user object
      await user.save();
      res.send(await User.findById(user._id).populate('profile_pic'));

      return;
    });
    return;
  }
  res.status(401).send({ error: 'not logged in' });
  return;
}

export async function getFile(req, res) {
  const name = req.params.name;

  // try to send the file
  res.sendFile(`/usr/backend/uploads/${name}`, (err) => {
    // if file not found then 404
    if (err) {
      res.status(404).send({ error: 'file not found' });
      return;
    }
  });
}

export async function setCommunityBanner(req, res) {
  // must be a request type that can send files
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ error: 'content-type must be multipart/form-data' });
    return;
  }

  // must be logged in
  if (req.isAuthenticated()) {
    // community must be valid and user must be mod
    let community = req.query.id;
    if (!mongoose.Types.ObjectId.isValid(community)) {
      res.status(400).send({ error: 'invalid community' });
      return;
    }
    community = await Community.findById(community);
    if (community && community.mods.includes(req.user._id)) {
      // save the file
      upload.single('file')(req, res, async (err) => {
        // file couldn't be fetched from request
        if (err) {
          res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
          return;
        }

        // get the file info and generate a receipt
        const file = req.file;
        let receipt = new UploadReceipt({
          creator: req.user._id,
          filename: file.filename,
          url: uploadBaseUrl + file.filename,
        });
        receipt = await receipt.save();

        // delete current profile pic if there is one
        let user = await User.findById(req.user._id).populate('profile_pic');

        // put receipt in user profile and community banner
        user.uploads.push(receipt._id);
        community.banner = receipt.url;

        await user.save();
        await community.save();

        // send new community object
        res.send(await Community.findById(community._id).populate('banner'));

        return;
      });
      return;
    } else {
      res.status(403).send({ error: 'not mod in community' });
      return;
    }
  }
  res.status(401).send({ error: 'not logged in' });
  return;
}
