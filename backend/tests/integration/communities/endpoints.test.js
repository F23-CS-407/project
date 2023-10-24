import request from 'supertest';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';
import { User } from '../../../src/authentication/schemas.js';

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

  it('should fail due to no name', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .send({ description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no description', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comm_name = 'test community';
    response = await request(app)
      .post('/create_community')
      .send({ name: comm_name, mods: [user._id] });
    expect(response.statusCode).toBe(400);
  });

  it('should fail due to no mods', async () => {
    const app = await createTestApp();

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    let response = await request(app).post('/create_community').send({ name: comm_name, description: comm_desc });
    expect(response.statusCode).toBe(400);
  });

  it('should create a new community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(comm_name);
  });

  it("should add community to mods' mod_for list", async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const other_user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
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
    let response = await request(app)
      .post('/create_community')
      .send({ name: comm_name, description: comm_desc, mods: comm_mods });
    expect(response.statusCode).toBe(400);
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
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const name = 'test community';
    const description = 'description';

    response = await request(app)
      .post('/create_community')
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
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const name = 'test community';
    const name2 = 'test';
    const description = 'description';

    response = await request(app)
      .post('/create_community')
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .post('/create_community')
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
    expect(response.statusCode).toBe(200);
    const user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;

    response = await request(app).get(`/community?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(comm_name);
  });
});
