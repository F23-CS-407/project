import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

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

    await new User({ username, password_hash: hash(password) }).save();
    const response = await request(await createTestApp())
      .post('/create_user')
      .send({ username, password });
    expect(response.statusCode).toBe(409);
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
    const not_password = 'boohoo';

    await new User({ username, password_hash: hash(password) }).save();
    const response = await request(await createTestApp())
      .post('/login')
      .send({ username, password: not_password });
    expect(response.statusCode).toBe(401);
  });

  it('should give user object on username and password match', async () => {
    const username = 'username';
    const password = 'password';

    await new User({ username, password_hash: hash(password) }).save();
    const response = await request(await createTestApp())
      .post('/login')
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

    await new User({ username, password_hash: hash(password) }).save();
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
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).delete('/logout');
    expect(response.statusCode).toBe(401);
  });

  it('should logout when authenticated', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).get('/auth_test');
    expect(response.statusCode).toBe(401);

    await new User({ username, password_hash: hash(password) }).save();
    response = await request(app).post('/login').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).delete('/logout').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).get('/auth_test');
    expect(response.statusCode).toBe(401);
  });
});
