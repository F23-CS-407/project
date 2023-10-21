import request from 'supertest';

import createTestApp from '../../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../../src/debug/jest-mongo.js';

import { Community } from '../../../../src/communities/schemas.js';
import { User } from '../../../../src/authentication/schemas.js';
import { Post } from '../../../../src/communities/posts/schemas.js';

describe('POST /create_post', () => {
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
    const community = response.body;

    const post = {};
    response = await request(app).post('/create_post').send({ post, community: community._id, user: user._id });
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
    const community = response.body;

    const post = {};
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post, community: community._id, user: user._id });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no community', async () => {
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
    response = await request(app).post('/create_post').set('Cookie', cookie).send({ post, user: user._id });
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
    const community = response.body;

    const post = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post, community: community._id, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
  });
});

describe('GET /community/posts', () => {
  useMongoTestWrapper();

  it('should fail due to not provided community id', async () => {
    const app = await createTestApp();

    let response = await request(app).get(`/community/posts`);
    expect(response.statusCode).toBe(400);
  });

  it('should return 0 posts', async () => {
    const app = await createTestApp();

    const new_user = new User({
      username: 'username',
      password: 'password',
    });

    const new_community = new Community({
      name: 'Test comm',
      desc: 'A test',
    });

    const user = await new_user.save();
    const community = await new_community.save();

    let response = await request(app).get(`/community/posts?community=${community._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should return 1 post', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_community = new Community({
      name: 'Test comm',
      desc: 'A test',
    });

    const community = await new_community.save();

    const post = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post, community: community._id, user: user._id });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/community/posts?community=${community._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe('GET /user/posts', () => {
  useMongoTestWrapper();

  it('should fail due to not provided user id', async () => {
    const app = await createTestApp();

    let response = await request(app).get(`/user/posts`);
    expect(response.statusCode).toBe(400);
  });

  it('should return 0 posts', async () => {
    const app = await createTestApp();

    const new_user = new User({
      username: 'username',
      password: 'password',
    });

    const user = await new_user.save();

    let response = await request(app).get(`/user/posts?user_id=${user._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should return 1 post', async () => {
    const app = await createTestApp();

    const new_user = new User({
      username: 'username',
      password: 'password',
    });

    const user = await new_user.save();
    const new_post = new Post({ content: 'Test', created_by: user._id });
    new_post.save();

    let response = await request(app).get(`/user/posts?user_id=${user._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe('POST /like_post', () => {
  useMongoTestWrapper();

  it('should fail because no auth', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).post('/like_post').send({ user: user._id });
    expect(response.statusCode).toBe(401);
  });

  it('should fail because no post was sent', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).post('/like_post').set('Cookie', cookie).send({ user: user._id });
    expect(response.statusCode).toBe(400);
  });

  it('should return the post with 1 like', async () => {
    const app = await createTestApp();

    const new_post = new Post({
      content: 'Test content',
    });

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;
    const post = await new_post.save();

    response = await request(app).post('/like_post').set('Cookie', cookie).send({ user: user._id, post: post._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.liked_by).toHaveLength(1);
  });

  it('should fail because the post was already liked', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
      liked_by: [user._id],
    });

    const post = await new_post.save();

    response = await request(app).post('/like_post').set('Cookie', cookie).send({ user: user._id, post: post._id });
    expect(response.statusCode).toBe(409);
  });
});

describe('DELETE /like_post', () => {
  useMongoTestWrapper();

  it('should fail because no post was sent', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).delete('/like_post').set('Cookie', cookie).send({ user: user._id });
    expect(response.statusCode).toBe(400);
  });

  it('should fail because no auth', async () => {
    const app = await createTestApp();

    const new_post = new Post({
      content: 'Test content',
    });

    const post = await new_post.save();

    let response = await request(app).delete('/like_post').send({ post: post._id });
    expect(response.statusCode).toBe(401);
  });

  it('should return a post with 0 likes', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const new_post = new Post({
      content: 'Test content',
      liked_by: [user._id],
    });

    const post = await new_post.save();

    response = await request(app).delete('/like_post').set('Cookie', cookie).send({ user: user._id, post: post._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.liked_by).toHaveLength(0);
  });

  it('should fail because the post was not already liked', async () => {
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

    response = await request(app).delete('/like_post').set('Cookie', cookie).send({ user: user._id, post: post._id });
    expect(response.statusCode).toBe(409);
  });
});

describe('GET /post/likes', () => {
  useMongoTestWrapper();

  it('should fail because no post was sent', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/post/likes');
    expect(response.statusCode).toBe(400);
  });

  it('should give an empty array of likes', async () => {
    const app = await createTestApp();

    const new_post = new Post({
      content: 'Test content',
    });
    const post = await new_post.save();

    let response = await request(app).get(`/post/likes?post=${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should have a like array length of 1', async () => {
    const app = await createTestApp();

    const new_user = new User({
      username: 'username',
      password: 'password',
    });
    const user = await new_user.save();

    const new_post = new Post({
      content: 'Test content',
      liked_by: [user._id],
    });
    const post = await new_post.save();

    let response = await request(app).get(`/post/likes?post=${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe('GET /post', () => {
  useMongoTestWrapper();

  it('should 400 when id not provided', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/post');
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id not real', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/post?id=fake');
    expect(response.statusCode).toBe(404);
  });

  it('should return Post object', async () => {
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body;

    const post = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post, community: community._id, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
    const id = response.body._id;

    response = await request(app).get(`/post?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
  });
});
