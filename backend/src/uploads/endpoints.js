import { User } from '../authentication/schemas.js';
import { UploadReceipt } from './schema.js';
import { upload } from './utils.js';
import { Community } from '../communities/schemas.js';
import mongoose from 'mongoose';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import webvtt from 'node-webvtt';
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

  upload.any()(req, res, async (err) => {
    // file couldn't be fetched from request
    if (err) {
      res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
      return;
    }

    // get the file info and generate a receipt
    const file = req.files.find((f) => f.fieldname == 'file');
    const captions = req.files.find((f) => f.fieldname == 'captions');

    if (!file) {
      res.status(400).send({ error: 'file must be sent in "file" key of form-data' });
      return;
    }

    let raw = file.filename;
    let raw_hash = raw.split('.')[0];

    let raw_sub = captions ? captions.filename : '';
    let raw_sub_hash = raw_sub.split('.')[0];

    let subtitleMaster = null;

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg(uploadBase + file.filename, { timeout: 432000 })
      .addOptions(['-hls_time 10', '-f hls', '-hls_list_size 0', '-muxdelay 0'])
      .output(uploadBase + file.filename.split('.')[0] + '.m3u8')
      .on('end', async () => {
        // generate receipts, return m3u8

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

        if (captions) {
          // if subtitle file is given, make it HLS
          try {
            const input = fs.readFileSync(uploadBase + captions.filename, 'utf8').toString();
            const startOffset = 0;

            // get segment duration generated by ffmpeg
            let segmentDuration = parseInt(
              fs
                .readFileSync(uploadBase + file.filename.split('.')[0] + '.m3u8', 'utf8')
                .match(/#EXT-X-TARGETDURATION:[0-9]+/)[0]
                .split(':')[1],
            );

            // get master and time segment parts from .vtt
            webvtt.parse(input);
            let playlist = webvtt.hls.hlsSegmentPlaylist(input, segmentDuration);
            let segments = webvtt.hls.hlsSegment(input, segmentDuration, startOffset).reverse();

            // replace filenames to include hash
            let replaceList = {};
            segments = segments.map((s) => {
              replaceList[s.filename] = raw_sub_hash + s.filename;
              return { ...s, filename: raw_sub_hash + s.filename };
            });
            for (const [key, value] of Object.entries(replaceList)) {
              playlist = playlist.replaceAll('\n' + key + '\n', '\n' + uploadBaseUrl + value + '\n');
            }

            // save files and generate receipts
            fs.writeFileSync(uploadBase + raw_sub_hash + '.m3u8', playlist);
            subtitleMaster = uploadBaseUrl + raw_sub_hash + '.m3u8';

            let receipt = new UploadReceipt({
              creator: req.user._id,
              filename: raw_sub_hash + '.m3u8',
              url: uploadBaseUrl + raw_sub_hash + '.m3u8',
            });
            receipt = await receipt.save();
            user.uploads.push(receipt._id);
            user = await user.save();

            for (let s of segments) {
              fs.writeFileSync(uploadBase + s.filename, s.content);
              let receipt = new UploadReceipt({
                creator: req.user._id,
                filename: s.filename,
                url: uploadBaseUrl + s.filename,
              });
              receipt = await receipt.save();
              user.uploads.push(receipt._id);
              user = await user.save();
            }

            fs.rmSync(uploadBase + raw_sub);
          } catch (err) {
            res.status(400).send({ error: 'captions not proper WebVTT' });
            return;
          }
        }

        if (subtitleMaster) {
          // subtitles are there, make a master m3u8 that points to the video and caption m3u8s
          let master =
            '#EXTM3U\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=NO,FORCED=NO,URI="sub_master",LANGUAGE="en"\n#EXT-X-STREAM-INF:SUBTITLES="subs"\nvid_master';
          master = master.replace('sub_master', subtitleMaster).replace('vid_master', m3u8.filename);

          let masterName = 'master-' + m3u8.filename;
          fs.writeFileSync(uploadBase + masterName, master);

          let receipt = new UploadReceipt({
            creator: req.user._id,
            filename: masterName,
            url: uploadBaseUrl + masterName,
          });
          receipt = await receipt.save();

          user.uploads.push(receipt._id);
          user = await user.save();

          m3u8 = receipt;
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

export async function setCommunityMap(req, res) {
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

        let user = await User.findById(req.user._id);

        // put receipt in user profile and community banner
        user.uploads.push(receipt._id);
        community.map = receipt.url;

        await user.save();
        await community.save();

        // send new community object
        res.send(await Community.findById(community._id));

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
