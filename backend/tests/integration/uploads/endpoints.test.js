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

describe('POST /upload/profile_pic', () => {
  useMongoTestWrapper();

  it('should fail if not multi part form data', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/upload/profile_pic').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail if not authenticated', async () => {
    const app = await createTestApp();

    request(app)
      .post('/upload/profile_pic')
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
      .post('/upload/profile_pic')
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
      .post('/upload/profile_pic')
      .attach('file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);

    // return should be new user object
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(user._id);

    // upload should be in user uploads
    expect(response.body.uploads.length).toBe(1);

    // profile pic should be populated receipt
    expect(response.body.profile_pic).toBeTruthy();
    expect(response.body.profile_pic.creator).toBe(user._id);

    // stored file should be the same as what is uploaded
    expect(
      fs
        .readFileSync(folderPath + 'tst-img1.jpeg')
        .equals(fs.readFileSync(storePath + response.body.profile_pic.filename)),
    ).toBe(true);
  });
});

describe('GET /upload/:name', () => {
  useMongoTestWrapper();

  it('should fail if name is invalid', async () => {
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
    expect(response.statusCode).toBe(200);
    let receipt = response.body;

    response = await request(app).get('/upload/not-a-file.txt');
    expect(response.statusCode).toBe(404);
  });

  it('should return file', async () => {
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
    expect(response.statusCode).toBe(200);
    let receipt = response.body;

    // get the file
    response = await request(app).get(`/upload/${receipt.filename}`);

    // content should be what was uploaded
    expect(response.statusCode).toBe(200);
    expect(response.body.equals(fs.readFileSync(folderPath + 'tst-img1.jpeg'))).toBe(true);
  });
});

describe('POST /upload/community_banner', () => {
  useMongoTestWrapper();

  it('should fail if not multi part form data', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/upload/community_banner').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail if not authenticated', async () => {
    const app = await createTestApp();

    request(app)
      .post('/upload/community_banner')
      .attach('file', folderPath + 'tst-img1.jpeg')
      .end((err, response) => {
        expect(response.statusCode).toBe(401);
      });
  });

  it('should fail if not mod in valid community', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    let user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    let user2 = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    let comm = response.body;

    // not a community
    response = await request(app)
      .post('/upload/community_banner?id=fake')
      .attach('file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(400);

    // not a mod
    response = await request(app)
      .post(`/upload/community_banner?id=${comm._id}`)
      .attach('file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(403);
  });

  it('should fail if not attached as "file"', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    let user = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let comm = response.body;

    response = await request(app)
      .post(`/upload/community_banner?id=${comm._id}`)
      .attach('not-file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should return community, save file, and update user', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // create user
    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: comm_name, description: comm_desc, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let comm = response.body;

    // upload file
    response = await request(app)
      .post(`/upload/community_banner?id=${comm._id}`)
      .attach('file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);

    // return should be new community object
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(comm._id);

    // upload should be in user uploads
    user = await User.findById(user._id);
    expect(user.uploads.length).toBe(1);

    // profile pic should be populated receipt
    expect(response.body.banner).toBeTruthy();
    expect(user._id.equals(response.body.banner.creator)).toBe(true);

    // stored file should be the same as what is uploaded
    expect(
      fs.readFileSync(folderPath + 'tst-img1.jpeg').equals(fs.readFileSync(storePath + response.body.banner.filename)),
    ).toBe(true);
  });
});
