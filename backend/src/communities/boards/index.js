import { createBoard } from './endpoints.js';

export default function useBoards(app) {
  app.post('/create_board', createBoard);

  return app;
}
