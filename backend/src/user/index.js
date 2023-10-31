import { changeUsername, changeDescription, getUser, changePassword } from './endpoints.js';

export default function useUser(app) {
  app.post('/change_username', changeUsername);

  app.post('/change_description', changeDescription);

  app.get('/user', getUser);

  app.post('/change_password', changePassword);

  return app;
}
