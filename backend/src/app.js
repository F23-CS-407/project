import express from 'express';
import body_parser from 'body-parser';

import useAuthentication from './authentication/index.js';
import useCommunities from './communities/index.js';

export default async function createApp() {
  // set up express and define app
  let app = express();
  app.use(body_parser.json());
  app.use(body_parser.urlencoded({ extended: false }));

  // use authentication
  app = useAuthentication(app);
  app = useCommunities(app);

  return app;
}
