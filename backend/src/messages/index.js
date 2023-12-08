import { newMessage, getMessages, getUsersInvolved } from './endpoints.js';

export default function useMessages(app) {
  app.get('/messages/:userId', getUsersInvolved);
  app.post('/messages/newMessage', newMessage);
  app.get('/messages/:user1Id/:user2Id', getMessages);

  return app;
}
