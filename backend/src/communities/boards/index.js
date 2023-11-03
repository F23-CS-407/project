import { createBoard, deleteBoard, getBoard, getBoardPosts, getCommunityBoards, postInBoard } from './endpoints.js';
import { createMap, getMapByBoard } from './maps/endpoints.js';

export default function useBoards(app) {
  app.post('/board', createBoard);
  app.delete('/board', deleteBoard);
  app.get('/board', getBoard);
  app.get('/community/boards', getCommunityBoards);
  app.post('/board/post', postInBoard);
  app.get('/board/posts', getBoardPosts);

  app.post('/board/map', createMap);
  app.get('/board/map', getMapByBoard);

  app.post('/');

  return app;
}
