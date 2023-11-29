import { getFile, uploadFile, setProfilePic } from './endpoints.js';

export default function useUploads(app) {
  app.post('/upload', uploadFile);

  app.get('/upload/:name', getFile);

  app.post('/upload/profile_pic', setProfilePic);

  return app;
}
