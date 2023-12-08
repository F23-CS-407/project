import express from 'express';
import body_parser from 'body-parser';

import useAuthentication from './authentication/index.js';
import useCommunities from './communities/index.js';
import useUser from './user/index.js';
import useUploads from './uploads/index.js';
import useFeeds from './feeds/index.js';
import useReporting from './reports/index.js';
import useMessages from './messages/index.js';

export default async function createApp(options) {
  // set up express and define app
  let app = express();
  app.use(body_parser.json());
  app.use(body_parser.urlencoded({ extended: true }));

  // use authentication
  app = useAuthentication(app, options);

  // use uploads
  app = useUploads(app);

  //use communities
  app = useCommunities(app);

  // use users
  app = useUser(app);

  // use feeds
  app = useFeeds(app);

  //use reporting
  app = useReporting(app);

  // use messages
  app = useMessages(app);

  return app;
}
