import { getFile, uploadFile, setProfilePic, setCommunityBanner, uploadClip, setCommunityMap } from './endpoints.js';

export default function useUploads(app) {
  app.post('/upload', uploadFile);

  app.get('/upload/:name', getFile);

  app.post('/upload/profile_pic', setProfilePic);

  app.post('/upload/community_banner', setCommunityBanner);

  app.post('/upload/clip', uploadClip);

  app.post('/upload/map', setCommunityMap);

  return app;
}
