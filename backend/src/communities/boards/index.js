import { createBoard, deleteBoard } from './endpoints.js';

export default function useBoards(app) {
  app.post('/create_board', createBoard);
  app.delete('/board', deleteBoard);

  return app;
}
