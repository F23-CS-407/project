import request from 'supertest';

import createTestApp from '../../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../../src/debug/jest-mongo.js';
import { Community } from '../../../../src/communities/schemas.js';
import { Board } from '../../../../src/communities/boards/schemas.js';
import { User } from '../../../../src/authentication/schemas.js';
import { Post } from '../../../../src/communities/posts/schemas.js';
import { Comment } from '../../../../src/communities/posts/comments/schemas.js';

describe('POST /board', () => {
  useMongoTestWrapper();

  it('should fail with missing body params', async () => {
    const app = await createTestApp();
    const name = 'board';
    const community = 'fakeId';

    let response = await request(app).post('/board').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/board').send({ name });
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/board').send({ community });
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid community', async () => {
    const app = await createTestApp();
    const name = 'board';
    const community = 'fakeId';

    let response = await request(app).post('/board').send({ name, community });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').send({ name, community });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when not mod', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2 = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(403);
  });

  it('should return board and update community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;
    expect(board.name).toBe(name);
    expect(board.parent).toBe(community);

    community = await Community.findById(community);
    expect(community.boards.length).toBe(1);
    expect(community.boards.includes(board._id)).toBe(true);
  });

  it('should fail when board name is already in use', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(409);
  });
});

describe('DELETE /board', () => {
  useMongoTestWrapper();

  it('should fail with missing board', async () => {
    const app = await createTestApp();
    const board = '';

    let response = await request(app).delete('/board').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid board', async () => {
    const app = await createTestApp();
    const board = 'board';

    let response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when not mod', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2 = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie2).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    response = await request(app).delete('/board').set('Cookie', cookie).send({ board });
    expect(response.statusCode).toBe(403);
  });

  it('should delete the board and follow procedure', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;
    expect(board.name).toBe(name);
    expect(board.parent).toBe(community);
    expect((await Board.find()).length).toBe(1);

    let post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board: board._id });
    expect(response.statusCode).toBe(200);
    post = response.body;
    expect((await Post.find()).length).toBe(1);

    community = await Community.findById(community);
    expect(community.boards.length).toBe(1);
    expect(community.boards.includes(board._id)).toBe(true);

    response = await request(app).delete('/board').set('Cookie', cookie).send({ board: board._id });
    expect(response.statusCode).toBe(200);

    // board should not be in database
    expect((await Board.find()).length).toBe(0);

    // community should have no boards
    community = await Community.findById(community);
    expect(community.boards.length).toBe(0);

    // post should be deleted
    expect((await Post.find()).length).toBe(0);
  });
});

describe('GET /board', () => {
  useMongoTestWrapper();

  it('should fail with missing id param', async () => {
    const app = await createTestApp();
    const id = '';

    let response = await request(app).get('/board');
    expect(response.statusCode).toBe(400);

    response = await request(app).get(`/board?id=${id}`);
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid id', async () => {
    const app = await createTestApp();
    const id = 'fakeId';

    let response = await request(app).get(`/board?id=${id}`);
    expect(response.statusCode).toBe(404);
  });

  it('should return board', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;

    response = await request(app).get(`/board?id=${board._id}`);
    expect(response.statusCode).toBe(200);
    let got_board = response.body;
    expect(got_board.name).toBe(name);
    expect(got_board.parent).toBe(community);
  });
});

describe('GET /community/boards', () => {
  useMongoTestWrapper();

  it('should fail with missing id param', async () => {
    const app = await createTestApp();
    const id = '';

    let response = await request(app).get('/community/boards');
    expect(response.statusCode).toBe(400);

    response = await request(app).get(`/community/boards?id=${id}`);
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid id', async () => {
    const app = await createTestApp();
    const id = 'fakeId';

    let response = await request(app).get(`/community/boards?id=${id}`);
    expect(response.statusCode).toBe(404);
  });

  it('should return boards', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;

    response = await request(app).get(`/community/boards?id=${community}`);
    expect(response.statusCode).toBe(200);
    let got_boards = response.body;
    expect(got_boards.length).toBe(1);
    expect(got_boards[0].name).toBe(name);
    expect(got_boards[0].parent).toBe(community);
  });
});

describe('POST /board/post', () => {
  useMongoTestWrapper();

  it('should fail due to no auth', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = {};
    response = await request(app).post('/board/post').send({ post, board: board, user: user._id });
    expect(response.statusCode).toBe(401);
  });

  it('should fail due to no content', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = {};
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board, user: user._id });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no board', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, user: user._id });
    expect(response.statusCode).toBe(400);
  });

  it('should create a new post', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
  });

  it('should update parent and user', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);

    // should be in board
    board = await Board.findById(board);
    expect(board.posts.includes(response.body._id)).toBe(true);

    // should be in user
    user = await User.findById(user._id);
    expect(user.posts.includes(response.body._id)).toBe(true);
  });

  it('should be compatible with DELETE /post', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    const cookie2 = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user2 = response.body;

    // user makes community
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    // user posts in board
    let post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
    post = response.body;

    // user2 comments on post
    let comment = { content: 'Test comment content' };
    response = await request(app).post('/create_comment').set('Cookie', cookie2).send({ post: post._id, comment });
    expect(response.statusCode).toBe(200);
    comment = response.body;

    // user2 likes post
    response = await request(app).post('/like_post').set('Cookie', cookie2).send({ post: post._id });
    expect(response.statusCode).toBe(200);

    // there is one post in the board
    board = await Board.findById(board);
    expect(board.posts.length).toBe(1);
    expect(board.posts.includes(post._id)).toBe(true);

    // user has one post
    user = await User.findById(user._id);
    expect(user.posts.length).toBe(1);
    expect(user.posts.includes(post._id)).toBe(true);

    // user2 has one liked post and one comment
    user2 = await User.findById(user2._id);
    expect(user2.comments.length).toBe(1);
    expect(user2.comments.includes(comment._id)).toBe(true);
    expect(user2.liked_posts.length).toBe(1);
    expect(user2.liked_posts.includes(post._id)).toBe(true);

    // database has one comment and one post
    expect((await Post.find()).length).toBe(1);
    expect((await Comment.find()).length).toBe(1);

    // user deletes their post
    response = await request(app).delete('/post').set('Cookie', cookie).send({ post: post._id });
    expect(response.statusCode).toBe(200);

    // there are no posts in the board
    board = await Board.findById(board);
    expect(board.posts.length).toBe(0);

    // user has 0 posts
    user = await User.findById(user._id);
    expect(user.posts.length).toBe(0);

    // user2 has 0 liked posts and 0 comments
    user2 = await User.findById(user2._id);
    expect(user2.comments.length).toBe(0);
    expect(user2.liked_posts.length).toBe(0);

    // database has 0 comments and 0 posts
    expect((await Post.find()).length).toBe(0);
    expect((await Comment.find()).length).toBe(0);
  });
});
