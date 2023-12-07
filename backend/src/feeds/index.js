import { getFeed } from './endpoints.js';

export default function useFeeds(app) {
  app.get('/feed', getFeed);

  return app;
}
