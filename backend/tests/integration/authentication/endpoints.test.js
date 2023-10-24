import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';
import { Community } from '../../../src/communities/schemas.js';
import { Comment } from '../../../src/communities/posts/comments/schemas.js';
import { Post } from '../../../src/communities/posts/schemas.js';

describe('POST /create_user', () => {
  useMongoTestWrapper();

  it('should 400 without username or password', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/create_user').send({ username: 'hi' });
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/create_user').send({ password: 'hi' });
    expect(response.statusCode).toBe(400);
  });

  it('should 409 when user exists', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    const response = await request(await createTestApp())
      .post('/create_user')
      .send({ username, password });
    expect(response.statusCode).toBe(409);
  });

  it('should have different hashes for the same password', async () => {
    const username1 = 'username';
    const username2 = 'username2';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username: username1, password });
    const hash1 = response.body.password_hash;
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/create_user').send({ username: username2, password });
    const hash2 = response.body.password_hash;
    expect(response.statusCode).toBe(200);

    expect(hash1).not.toEqual(hash2);
  });

  it('should give user object on sucess', async () => {
    const username = 'username';
    const password = 'password';

    const response = await request(await createTestApp())
      .post('/create_user')
      .send({ username, password });
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
  });

  it('should be authenticated on success', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).get('/auth_test');
    expect(response.statusCode).toBe(401);

    response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(username);
  });
});

describe('POST /login', () => {
  useMongoTestWrapper();

  it('should 400 without username or password', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/login').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/login').send({ username: 'hi' });
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/login').send({ password: 'hi' });
    expect(response.statusCode).toBe(400);
  });

  it('should 401 when user not found', async () => {
    const response = await request(await createTestApp())
      .post('/login')
      .send({ username: 'no', password: 'nope' });
    expect(response.statusCode).toBe(401);
  });

  it('should 401 when password does not match', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';
    const not_password = 'boohoo';

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    const response = await request(await createTestApp())
      .post('/login')
      .send({ username, password: not_password });
    expect(response.statusCode).toBe(401);
  });

  it('should give user object on username and password match', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    const response = await request(await createTestApp())
      .post('/login')
      .send({ username, password });
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
  });

  it('should be authenticated on success', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';
    const app = await createTestApp();

    let response = await request(app).get('/auth_test');
    expect(response.statusCode).toBe(401);

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    response = await request(app).post('/login').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(username);
  });
});

describe('DELETE /logout', () => {
  useMongoTestWrapper();

  it('should 401 when not authenticated', async () => {
    let response = await request(await createTestApp()).delete('/logout');
    expect(response.statusCode).toBe(401);
  });

  it('should logout when authenticated', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';
    const app = await createTestApp();

    let response = await request(app).get('/auth_test');
    expect(response.statusCode).toBe(401);

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    response = await request(app).post('/login').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).delete('/logout').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(401);
  });
});

describe('DELETE /delete_user', () => {
  useMongoTestWrapper();

  it('should 401 when not authenticated', async () => {
    let response = await request(await createTestApp()).delete('/delete_user');
    expect(response.statusCode).toBe(401);
  });

  it('should 400 when password not given', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    expect(cookie).toBeTruthy();

    response = await request(app).delete('/delete_user').set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should 401 when password is incorrect', async () => {
    const username = 'username';
    const password = 'password';
    const not_password = 'incorrect';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    expect(cookie).toBeTruthy();

    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password: not_password });
    expect(response.statusCode).toBe(401);
  });

  it('should delete user data', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    expect(cookie).toBeTruthy();
    expect((await User.find({ username })).length).toBe(1);

    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password });
    expect(response.statusCode).toBe(200);
    expect((await User.find({ username })).length).toBe(0);
  });

  it('should remove user from mod lists', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user1id = response.body._id;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const user2id = response.body._id;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user1id, user2id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;
    expect(community.mods.includes(user1id)).toBe(true);
    expect(community.mods.includes(user2id)).toBe(true);

    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password });
    expect(response.statusCode).toBe(200);
    expect((await User.find({ username })).length).toBe(0);

    community = await Community.findById(community._id);
    expect(community.mods.includes(user1id)).toBe(false);
    expect(community.mods.includes(user2id)).toBe(true);
  });

  it('should delete user comments', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // user1 and user 2
    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user1id = response.body._id;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2id = response.body._id;

    // user2 makes community
    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user1id, user2id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;
    expect(community.mods.includes(user1id)).toBe(true);
    expect(community.mods.includes(user2id)).toBe(true);

    // user2 makes post
    const post = { content: 'Test' };
    response = await request(app).post('/create_post').set('Cookie', cookie2).send({ post, community: community._id });
    expect(response.statusCode).toBe(200);

    // user1 comments
    let comment = { content: 'Test comment content' };
    response = await request(app)
      .post('/create_comment')
      .set('Cookie', cookie)
      .send({ post: response.body._id, comment });
    expect(response.statusCode).toBe(200);
    expect((await Comment.find()).length).toBe(1);

    // user1 deletes account
    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password });
    expect(response.statusCode).toBe(200);
    expect((await User.find({ username })).length).toBe(0);
    expect((await Comment.find()).length).toBe(0);
  });

  it('should delete user likes and posts', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // user1 and user 2
    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user1id = response.body._id;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2id = response.body._id;

    // user2 makes community
    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user1id, user2id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;
    expect(community.mods.includes(user1id)).toBe(true);
    expect(community.mods.includes(user2id)).toBe(true);

    // user makes post
    let post1 = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post: post1, community: community._id });
    expect(response.statusCode).toBe(200);
    post1 = response.body;

    // user2 makes post
    let post2 = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie2)
      .send({ post: post2, community: community._id });
    expect(response.statusCode).toBe(200);
    post2 = response.body;

    // user1 likes user2's post
    response = await request(app).post('/like_post').set('Cookie', cookie).send({ post: post2._id });
    expect(response.statusCode).toBe(200);

    // user2 likes user1's post
    response = await request(app).post('/like_post').set('Cookie', cookie2).send({ post: post1._id });
    expect(response.statusCode).toBe(200);

    // database has 2 posts
    expect((await Post.find()).length).toBe(2);

    // community has 2 posts
    community = await Community.findById(community._id);
    expect(community.posts.length).toBe(2);
    expect(community.posts.includes(post1._id)).toBe(true);
    expect(community.posts.includes(post2._id)).toBe(true);

    // user1 has one post and liked user2's post
    let user1 = await User.findById(user1id);
    expect(user1.posts.length).toBe(1);
    expect(user1.posts.includes(post1._id)).toBe(true);
    expect(user1.liked_posts.length).toBe(1);
    expect(user1.liked_posts.includes(post2._id)).toBe(true);

    // user2 has one post and liked user1's post
    let user2 = await User.findById(user2id);
    expect(user2.posts.length).toBe(1);
    expect(user2.posts.includes(post2._id)).toBe(true);
    expect(user2.liked_posts.length).toBe(1);
    expect(user2.liked_posts.includes(post1._id)).toBe(true);

    // post1 liked by user2
    post1 = await Post.findById(post1._id);
    expect(post1.liked_by.length).toBe(1);
    expect(post1.liked_by.includes(user2._id)).toBe(true);

    // post2 liked by user1
    post2 = await Post.findById(post2._id);
    expect(post2.liked_by.length).toBe(1);
    expect(post2.liked_by.includes(user1._id)).toBe(true);

    // user1 deletes account
    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password });
    expect(response.statusCode).toBe(200);

    // database has 1 post
    expect((await Post.find()).length).toBe(1);

    // community has 1 post
    community = await Community.findById(community._id);
    expect(community.posts.length).toBe(1);
    expect(community.posts.includes(post2._id)).toBe(true);

    // user2 has one post and liked no posts
    user2 = await User.findById(user2id);
    expect(user2.posts.length).toBe(1);
    expect(user2.posts.includes(post2._id)).toBe(true);
    expect(user2.liked_posts.length).toBe(0);

    // post2 liked by no one
    post2 = await Post.findById(post2._id);
    expect(post2.liked_by.length).toBe(0);
  });

  it('should logout', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    expect(cookie).toBeTruthy();

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).delete('/delete_user').set('Cookie', cookie).send({ password });
    expect(response.statusCode).toBe(200);

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(401);
  });
});

describe('GET /user_info', () => {
  useMongoTestWrapper();

  it('should 401 when not authenticated', async () => {
    let response = await request(await createTestApp()).get('/user_info');
    expect(response.statusCode).toBe(401);
  });

  it('should return scrubbed logged in user', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    expect(cookie).toBeTruthy();
    expect((await User.find({ username })).length).toBe(1);

    response = await request(app).get('/user_info').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
    expect(response.body.password_hash).toBe(undefined);
  });
});
