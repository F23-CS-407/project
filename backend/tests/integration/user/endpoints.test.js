import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

describe('POST /change_description', () => {
  useMongoTestWrapper();

  it('should fail when not logged in', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_description').send({ new_description: 'hello' });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when no new_description provided', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_description').set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should update description', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_description').set('Cookie', cookie).send({ new_description: 'hello' });
    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe('hello');
  });
});

describe('POST /change_username', () => {
  useMongoTestWrapper();

  it('should fail when not logged in', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_username').send({ new_username: 'hello' });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when no new_username provided', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_username').set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should update username', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_username').set('Cookie', cookie).send({ new_username: 'hello' });
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe('hello');
  });

  it('should fail when username is taken', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    response = await request(app).post('/create_user').send({ username: 'hello', password });
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/change_username').set('Cookie', cookie).send({ new_username: 'hello' });
    expect(response.statusCode).toBe(409);
  });
});

describe('GET /user', () => {
  useMongoTestWrapper();

  it('should 400 when id not provided', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/user');
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id not real', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/user?id=fake');
    expect(response.statusCode).toBe(404);
  });

  it('should return user object', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;

    response = await request(app).get(`/user?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
  });
});
