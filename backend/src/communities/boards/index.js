import { createBoard, deleteBoard, getBoard, getBoardPosts, getCommunityBoards, postInBoard } from './endpoints.js';

export default function useBoards(app) {
  app.post('/board', createBoard);
  app.delete('/board', deleteBoard);
  app.get('/board', getBoard);
  app.get('/community/boards', getCommunityBoards);
  app.post('/board/post', postInBoard);
  app.get('/board/posts', getBoardPosts);

  return app;
}
