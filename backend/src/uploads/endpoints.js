import { User } from '../authentication/schemas.js';
import { UploadReceipt } from './schema.js';
import { upload } from './utils.js';

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
      let receipt = new UploadReceipt({ creator: req.user._id, filename: file.filename });
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
      let receipt = new UploadReceipt({ creator: req.user._id, filename: file.filename });
      receipt = await receipt.save();

      // delete current profile pic if there is one
      let user = await User.findById(req.user._id).populate('profile_pic');
      if (user.profile_pic) {
        console.log('REACHED');
        await user.profile_pic.deleteRecursive();
      }
      user = await User.findById(req.user._id).populate('profile_pic');

      // put receipt in user profile and profile pic
      user.uploads.push(receipt._id);
      user.profile_pic = receipt._id;

      // send new user object
      res.send(await user.save());

      return;
    });
    return;
  }
  res.status(401).send({ error: 'not logged in' });
  return;
}

export async function getFile(req, res) {
  const name = req.params.name;

  // must have a filename
  if (!name) {
    res.status(400).send({ error: 'name missing' });
  }

  // try to send the file
  res.sendFile(`/usr/backend/uploads/${name}`, (err) => {
    // if file not found then 404
    if (err) {
      res.status(404).send({ error: 'file not found' });
      return;
    }
  });
}
