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

    // profile pic should be populated with url
    expect(response.body.profile_pic).toBeTruthy();

    // stored file should be the same as what is uploaded
    expect(
      fs
        .readFileSync(folderPath + 'tst-img1.jpeg')
        .equals(fs.readFileSync(storePath + response.body.profile_pic.split('/').pop())),
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

    // create community
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

    // banner should be populated with url
    expect(response.body.banner).toBeTruthy();

    // stored file should be the same as what is uploaded
    expect(
      fs
        .readFileSync(folderPath + 'tst-img1.jpeg')
        .equals(fs.readFileSync(storePath + response.body.banner.split('/').pop())),
    ).toBe(true);
  });
});

describe('POST /upload/clip', () => {
  useMongoTestWrapper();

  it('should fail if not multi part form data', async () => {
    const app = await createTestApp();

    let response = await request(app).post('/upload/clip').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should fail if not authenticated', async () => {
    const app = await createTestApp();

    request(app)
      .post('/upload/clip')
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

    response = await request(app)
      .post('/upload/clip')
      .attach('not-file', folderPath + 'tst-img1.jpeg')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should encode and return m3u8', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // create user
    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    // upload file
    response = await request(app)
      .post('/upload/clip')
      .attach('file', folderPath + 'tst-vid1.MOV')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.creator).toBe(user._id);
    expect(response.body.filename.includes('.m3u8')).toBe(true);
    expect(response.body.filename.includes('master')).toBe(false);

    // have one .m3u8 file and many .ts files
    user = await User.findById(user._id).populate('uploads');
    let uploads = fs.readdirSync(storePath);
    expect(uploads.length).toBe(user.uploads.length);
    for (const f of user.uploads) {
      expect(uploads.includes(f.filename)).toBe(true);
      expect(f.filename.includes('.ts') || f.filename.includes('.m3u8')).toBe(true);
    }
  }, 100000);

  it('should encode and return m3u8 with subtitles', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    // create user
    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    // upload file, should return a master .m3u8
    response = await request(app)
      .post('/upload/clip')
      .attach('file', folderPath + 'tst-vid2.webm')
      .attach('captions', folderPath + 'tst-vid2-caps.vtt')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.creator).toBe(user._id);
    expect(response.body.filename.includes('.m3u8')).toBe(true);
    expect(response.body.filename.includes('master')).toBe(true);

    // have 3 .m3u8 files, many .ts and .vtt files
    user = await User.findById(user._id).populate('uploads');
    let uploads = fs.readdirSync(storePath);
    expect(uploads.length).toBe(user.uploads.length);
    let m3u8c = 0;
    let tsc = 0;
    let vttc = 0;
    for (const f of user.uploads) {
      if (f.filename.includes('.m3u8')) {
        m3u8c += 1;
      } else if (f.filename.includes('.ts')) {
        tsc += 1;
      } else if (f.filename.includes('.vtt')) {
        vttc += 1;
      } else {
        // fail if not .m3u8, .ts, or .vtt
        expect(true).toBe(false);
      }
    }
    expect(m3u8c).toBe(3);
  }, 100000);
});
