import {
  changeUsername,
  changeDescription,
  getUser,
  followCommunity,
  unfollowCommunity,
  isFollowingCommunity,
} from './endpoints.js';

export default function useUser(app) {
  app.post('/change_username', changeUsername);

  app.post('/change_description', changeDescription);

  app.get('/user', getUser);

  app.post('/user/follow_community', followCommunity);

  app.post('/user/unfollow_community', unfollowCommunity);

  app.get('/user/is_following_community', isFollowingCommunity);

  return app;
}
