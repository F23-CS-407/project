import multer from 'multer';

import { hash } from '../authentication/utils';

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/usr/backend/uploads');
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    cb(null, file.fieldname + '-' + hash(Date.now().toString()) + ext);
  },
});

export const upload = multer({ storage: storage });
