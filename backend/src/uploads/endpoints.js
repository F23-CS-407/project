import { User } from '../authentication/schemas.js';
import { UploadReceipt } from './schema.js';
import { upload } from './utils.js';
import { Community } from '../communities/schemas.js';
import mongoose from 'mongoose';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';

const uploadBase = '/usr/backend/uploads/';

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

export async function uploadClip(req, res) {
  // must be a request type that can send files
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ error: 'content-type must be multipart/form-data' });
    return;
  }

  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }
  let user = await User.findById(req.user._id);

  upload.single('file')(req, res, async (err) => {
    // file couldn't be fetched from request
    if (err) {
      res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
      return;
    }

    // get the file info and generate a receipt
    const file = req.file;

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg(uploadBase + file.filename, { timeout: 432000 })
      .addOptions(['-hls_time 3', '-f hls'])
      .output(uploadBase + file.filename.split('.')[0] + '.m3u8')
      .on('end', async () => {
        // generate receipts, return m3u8
        let raw = file.filename;
        let raw_hash = raw.split('.')[0];

        let m3u8 = null;

        // delete raw file
        fs.rmSync(uploadBase + raw);

        // make receipts for the new files
        let files = fs.readdirSync(uploadBase).filter((f) => f.includes(raw_hash));

        for (const f of files) {
          const file = req.file;
          let receipt = new UploadReceipt({
            creator: req.user._id,
            filename: f,
            url: uploadBaseUrl + f,
          });
          receipt = await receipt.save();

          // put receipt in user profile and community banner
          user.uploads.push(receipt._id);
          user = await user.save();

          // if is m3u8 save to return
          if (f.includes('.m3u8')) {
            m3u8 = receipt;
          }
        }

        res.status(200).send(m3u8);
        return;
      })
      .on('error', () => {
        res.status(400).send({ error: 'could not encode clip' });
        return;
      })
      .run();
  });
}
