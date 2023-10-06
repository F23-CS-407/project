import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

describe('Authentication Cookies', () => {
  useMongoTestWrapper();

  it('should give a cookie upon user creation', async () => {
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

  it('should give a cookie upon login', async () => {
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

  it('should expire cookies', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';
    const app = await createTestApp({ cookieMaxAge: 300 });

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

    await new Promise((r) => setTimeout(r, 300));

    response = await request(app).get('/auth_test').set('Cookie', cookie);
    expect(response.statusCode).toBe(401);
  });
});
