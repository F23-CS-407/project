import { changeUsername, changeDescription } from './endpoints.js';

export default function useUser(app) {
  app.post('/change_username', changeUsername);

  app.post('/change_description', changeDescription);

  return app;
}
