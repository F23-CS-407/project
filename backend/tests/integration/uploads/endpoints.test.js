import request from 'supertest';
import fs from 'fs';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';
import { Community } from '../../../src/communities/schemas.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

const folderPath = '/usr/backend/tests/integration/uploads/';
const storePath = '/usr/backend/uploads/';

describe('POST /upload', () => {
  useMongoTestWrapper();

  it('should fail if not multi part form data', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/upload').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail if not authenticated', async () => {
    const app = await createTestApp();

    request(app)
      .post('/upload')
      .attach('file', folderPath + 'tst-img1.jpeg')
      .end((err, response) => {
        expect(response.statusCode).toBe(401);
      });
  });

  it('should fail if not attached as "file"', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    request(app)
      .post('/upload')
      .attach('not-file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie)
      .end((err, response) => {
        expect(response.statusCode).toBe(400);
      });
  });

  it('should return receipt, save file, and update user', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // create user
    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const user = response.body;
    const cookie = response.headers['set-cookie'];

    // upload file
    response = await request(app)
      .post('/upload')
      .attach('file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);

    // receipt should have user id
    expect(response.statusCode).toBe(200);
    expect(response.body.creator).toBe(user._id);

    // upload should be in user uploads
    expect((await User.findById(user._id)).uploads.length).toBe(1);
    expect((await User.findById(user._id)).uploads.includes(response.body._id)).toBe(true);

    // stored file should be the same as what is uploaded
    expect(
      fs.readFileSync(folderPath + 'tst-img1.jpeg').equals(fs.readFileSync(storePath + response.body.filename)),
    ).toBe(true);
  });
});
