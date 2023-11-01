import express from 'express';
import body_parser from 'body-parser';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

import useAuthentication from './authentication/index.js';
import useCommunities from './communities/index.js';
import useUser from './user/index.js';

export default async function createApp(options) {
  // set up express and define app
  let app = express();
  app.use(body_parser.json());
  app.use(body_parser.urlencoded({ extended: false }));

  // use authentication
  app = useAuthentication(app, options);

  //use communities
  app = useCommunities(app);

  // use users
  app = useUser(app);

  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/usr/backend/uploads');
    },
    filename: function (req, file, cb) {
      let extArray = file.mimetype.split('/');
      let extension = extArray[extArray.length - 1];
      cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    },
  });

  const upload = multer({ storage: storage });

  app.post('/upload', upload.single('file'), function (req, res) {
    const title = req.body.title;
    const file = req.file;

    console.log(title);
    console.log(file);

    res.send(file.filename);
  });

  app.get('/uploader', (req, res) => {
    const uploader = async () => {
      try {
        const file = fs.createReadStream('./mo.jpeg');
        const title = 'My file';

        const form = new FormData();
        form.append('title', title);
        form.append('file', file);

        const resp = await axios.post('http://localhost:3000/upload', form, {
          headers: {
            ...form.getHeaders(),
          },
        });

        if (resp.status === 200) {
          return resp.data;
        }
      } catch (err) {
        return new Error(err.message);
      }
    };
    uploader().then((resp) => res.send(resp));
    return;
  });

  app.get('/upload', (req, res) => {
    const name = req.query.name;

    res.sendFile(`/usr/backend/uploads/${name}`);
  });

  return app;
}
