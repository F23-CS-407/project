import useBoards from './boards/index.js';
import {
  createCommunity,
  query_communities,
  query_users,
  search_single_user,
  search_community_by_post_id,
  getCommunity,
  deleteCommunity,
} from './endpoints.js';
import { deleteComment, getComment, get_comments_by_post, new_comment } from './posts/comments/endpoints.js';
import {
  deletePost,
  getPost,
  get_likes,
  get_posts_by_community,
  get_posts_by_user_id,
  like_post,
  post_in_community,
  remove_like_post,
  user_post_like,
} from './posts/endpoints.js';

export default function useCommunities(app) {
  //community endpoints
  app.post('/create_community', createCommunity);
  app.get('/search_communities', query_communities);
  app.get('/search_users', query_users);
  app.get('/find_user', search_single_user);
  app.get('/search_community_by_post_id', search_community_by_post_id);
  app.get('/community', getCommunity);
  app.delete('/community', deleteCommunity);

  //post endpoints
  app.post('/create_post', post_in_community);
  app.get('/community/posts', get_posts_by_community);
  app.get('/user/posts', get_posts_by_user_id);
  app.post('/like_post', like_post);
  app.delete('/like_post', remove_like_post);
  app.get('/post/likes', get_likes);
  app.get('/post/user_liked', user_post_like);
  app.get('/post', getPost);
  app.delete('/post', deletePost);

  //comment endpoints
  app.post('/create_comment', new_comment);
  app.get('/post/comments', get_comments_by_post);
  app.get('/comment', getComment);
  app.delete('/comment', deleteComment);

  // board endpoints
  app = useBoards(app);

  return app;
}
