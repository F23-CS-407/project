import request from 'supertest';

import createTestApp from '../../../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../../../src/debug/jest-mongo.js';

import { User } from '../../../../../src/authentication/schemas.js';
import { Post } from '../../../../../src/communities/posts/schemas.js';
import { Comment } from '../../../../../src/communities/posts/comments/schemas.js';

describe('POST /create_comment', () => {
  useMongoTestWrapper();

  it('should fail due to no auth', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    response = await request(app).post('/create_comment').send({ post: post._id });
    expect(response.statusCode).toBe(401);
  });

  it('should fail due to no content', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    response = await request(app).post('/create_comment').set('Cookie', cookie).send({ post: post._id });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no post', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comment = { content: 'Test comment content' };

    response = await request(app).post('/create_comment').set('Cookie', cookie).send({ comment });
    expect(response.statusCode).toBe(400);
  });

  it('should make a new comment', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    const comment = { content: 'Test comment content' };

    response = await request(app).post('/create_comment').set('Cookie', cookie).send({ post: post._id, comment });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(comment.content);
    expect(response.body.parent == post._id).toBeTruthy();
  });

  it('should update post and user', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    let post = await new_post.save();

    const comment = { content: 'Test comment content' };

    response = await request(app).post('/create_comment').set('Cookie', cookie).send({ post: post._id, comment });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(comment.content);

    post = await Post.findById(post._id);
    user = await User.findById(user._id);
    expect(post.comments.includes(response.body._id)).toBe(true);
    expect(user.comments.includes(response.body._id)).toBe(true);
  });
});

describe('DELETE /comment', () => {
  useMongoTestWrapper();

  it('should fail when no comment', async () => {
    const app = await createTestApp();

    let response = await request(app).delete('/comment').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();

    let response = await request(app).delete('/comment').send({ comment: 'fake' });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when comment does not exist', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app).delete('/comment').set('Cookie', cookie).send({ comment: 'fake' });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when user is not creator', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    const cookie2 = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user2 = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    let post = await new_post.save();

    const comment = { content: 'Test comment content' };

    response = await request(app).post('/create_comment').set('Cookie', cookie2).send({ post: post._id, comment });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(comment.content);

    response = await request(app).delete('/comment').set('Cookie', cookie).send({ comment: response.body._id });
    expect(response.statusCode).toBe(403);
  });

  it('should delete the comment', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    let post = await new_post.save();

    const comment = { content: 'Test comment content' };

    response = await request(app).post('/create_comment').set('Cookie', cookie).send({ post: post._id, comment });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(comment.content);
    post = await Post.findById(post._id);
    expect(post.comments.includes(response.body._id)).toBeTruthy();
    user = await User.findById(user._id);
    expect(user.comments.includes(response.body._id)).toBe(true);
    expect((await Comment.find()).length).toBe(1);

    response = await request(app).delete('/comment').set('Cookie', cookie).send({ comment: response.body._id });
    expect(response.statusCode).toBe(200);
    post = await Post.findById(post._id);
    expect(post.comments.includes(response.body._id)).toBe(false);
    user = await User.findById(user._id);
    expect(user.comments.includes(response.body._id)).toBe(false);
    expect((await Comment.find()).length).toBe(0);
  });
});

describe('GET /post/comments', () => {
  useMongoTestWrapper();

  it('should fail because no post was sent', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/post/comments');
    expect(response.statusCode).toBe(400);
  });

  it('should give an empty array of comments', async () => {
    const app = await createTestApp();

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    let response = await request(app).get(`/post/comments?post=${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should have a comment array length of 1', async () => {
    const app = await createTestApp();

    const new_comment = new Comment({
      content: 'Test comment',
    });
    const comment = await new_comment.save();

    const new_post = new Post({
      content: 'Test content',
      comments: [comment._id],
    });
    const post = await new_post.save();

    let response = await request(app).get(`/post/comments?post=${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe('GET /comment', () => {
  useMongoTestWrapper();

  it('should 400 when id not provided', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/comment');
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id not real', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/comment?id=fake');
    expect(response.statusCode).toBe(404);
  });

  it('should return Comment object', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    const comment = { content: 'Test comment content' };

    response = await request(app)
      .post('/create_comment')
      .set('cookie', cookie)
      .send({ user: user._id, post: post._id, comment });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;

    response = await request(app).get(`/comment?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(comment.content);
  });
});
