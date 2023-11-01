import { upload } from './utils.js';

export async function uploadFile(req, res) {
  if (req.isAuthenticated()) {
    upload.single('file')(req, res, (err) => {
      const file = req.file;
      res.send(file.filename);
      return;
    });
    return;
  }
  res.status(401).send({ error: 'not logged in' });
  return;
}

export async function getFile(req, res) {
  (req, res) => {
    const name = req.query.name;

    res.sendFile(`/usr/backend/uploads/${name}`);
  };
}
