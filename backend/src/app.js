import express from 'express';
import body_parser from 'body-parser';

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

  return app;
}
