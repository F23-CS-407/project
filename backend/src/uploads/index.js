import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

import { getFile, uploadFile } from './endpoints.js';

export default function useUploads(app) {
  app.post('/upload', uploadFile);

  app.get('/upload/:name', getFile);

  return app;
}
