import request from 'supertest';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';
import { User } from '../../../src/authentication/schemas.js';
import { Community } from '../../../src/communities/schemas.js';
import { Post } from '../../../src/communities/posts/schemas.js';

describe('GET /search_users', () => {
  useMongoTestWrapper();

  it('should find nothing', async () => {
    const app = await createTestApp();

    const username = 'username';
    let response = await request(app).get(`/search_users?username=${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should find exactly one user', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/search_users?username=${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should find several users with regex', async () => {
    const app = await createTestApp();

    const username = 'username';
    const username2 = 'user';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/create_user').send({ username: username2, password });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/search_users?username=${username2}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe('POST /create_community', () => {
  useMongoTestWrapper();

  it('should fail due to no auth', async () => {
    const app = await createTestApp();

    const comm_desc = 'a test community';
    let response = await request(app).post('/create_community').send({ description: comm_desc, mods: [] });
    expect(response.statusCode).toBe(401);
  });

  it('should fail due to no name', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no description', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, mods: [user._id] });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no mods', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc });
    expect(response.statusCode).toBe(400);
  });

  it('should create a new community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

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
    expect(response.body.name).toBe(comm_name);
  });

  it('should fail because creator is not mod', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/create_user').send({ username: 'hello', password });
    expect(response.statusCode).toBe(200);
    const not_user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [not_user._id] });
    expect(response.statusCode).toBe(400);
  });

  it("should add community to mods' mod_for list", async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const other_user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id, other_user._id] });
    expect(response.statusCode).toBe(200);

    expect((await User.findById(user._id)).mod_for.includes(response.body._id)).toBe(true);
    expect((await User.findById(other_user._id)).mod_for.includes(response.body._id)).toBe(true);
  });

  it('should fail as the user ID is made up', async () => {
    const app = await createTestApp();
    const comm_name = 'test community';
    const comm_desc = 'a test community';
    const comm_mods = ['12345'];
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: comm_mods });
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /community', () => {
  useMongoTestWrapper();

  it('should fail when no community', async () => {
    const app = await createTestApp();

    let response = await request(app).delete('/community').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();

    let response = await request(app).delete('/community').send({ community: 'fake' });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when community does not exist', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app).delete('/community').set('Cookie', cookie).send({ community: 'fake' });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when user is not mod', async () => {
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

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name, description, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).delete('/community').set('Cookie', cookie).send({ community: response.body._id });
    expect(response.statusCode).toBe(403);
  });

  it('should delete the community and follow procedure', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    // user makes community
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    // user posts in community
    let post = { content: 'Test' };
    response = await request(app)
      .post('/create_post')
      .set('Cookie', cookie)
      .send({ post, community: community._id, user: user._id });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(post.content);
    post = response.body;

    // database has one community and one post
    expect((await Community.find()).length).toBe(1);
    expect((await Post.find()).length).toBe(1);

    // community has one post
    community = await Community.findById(community._id);
    expect(community.posts.length).toBe(1);
    expect(community.posts.includes(post._id)).toBe(true);

    // user mod_for has one and one post
    user = await User.findById(user._id);
    expect(user.mod_for.length).toBe(1);
    expect(user.mod_for.includes(community._id)).toBe(true);
    expect(user.posts.length).toBe(1);
    expect(user.posts.includes(post._id)).toBe(true);

    // user deletes the community
    response = await request(app).delete('/community').set('Cookie', cookie).send({ community: community._id });
    expect(response.statusCode).toBe(200);

    // database has no communities and no posts
    expect((await Community.find()).length).toBe(0);
    expect((await Post.find()).length).toBe(0);

    // user mod_for has 0 and no posts
    user = await User.findById(user._id);
    expect(user.mod_for.length).toBe(0);
    expect(user.posts.length).toBe(0);
  });
});

describe('GET /search_communities', () => {
  useMongoTestWrapper();

  it('should find nothing', async () => {
    const app = await createTestApp();

    const name = 'name';
    let response = await request(app).get(`/search_communities?name=${name}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('should find exactly one community', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const name = 'test community';
    const description = 'description';

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/search_communities?name=${name}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should find several communities with regex', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const name = 'test community';
    const name2 = 'test';
    const description = 'description';

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: name2, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/search_communities?name=${name2}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe('GET /find_user', () => {
  useMongoTestWrapper();

  it('should find no user', async () => {
    const app = await createTestApp();

    let response = await request(app).get(`/find_user?username=username`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(null);
  });

  it('should find a user', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/find_user?username=${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
  });
});

describe('GET /community', () => {
  useMongoTestWrapper();

  it('should 400 when id not provided', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/community');
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id not real', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/community?id=fake');
    expect(response.statusCode).toBe(404);
  });

  it('should return Community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;

    response = await request(app).get(`/community?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(comm_name);
  });
});
