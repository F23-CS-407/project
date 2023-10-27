import { createBoard, deleteBoard, getBoard, getCommunityBoards } from './endpoints.js';

export default function useBoards(app) {
  app.post('/create_board', createBoard);
  app.delete('/board', deleteBoard);
  app.get('/board', getBoard);
  app.get('/community/boards', getCommunityBoards);

  return app;
}
