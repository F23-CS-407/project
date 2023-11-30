import { getFile, uploadFile, setProfilePic, setCommunityBanner } from './endpoints.js';

export default function useUploads(app) {
  app.post('/upload', uploadFile);

  app.get('/upload/:name', getFile);

  app.post('/upload/profile_pic', setProfilePic);

  app.post('/upload/community_banner', setCommunityBanner);

  return app;
}
