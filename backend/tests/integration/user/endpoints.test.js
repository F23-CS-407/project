import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';
import { Community } from '../../../src/communities/schemas.js';

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
    expect(response.body.bio).toBe('hello');
  });

  it('should scrub response', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_description').set('Cookie', cookie).send({ new_description: 'hello' });
    expect(response.statusCode).toBe(200);
    expect(response.body.salt).toBe(undefined);
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

  it('should scrub response', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];

    response = await request(app).post('/change_username').set('Cookie', cookie).send({ new_username: 'hello' });
    expect(response.statusCode).toBe(200);
    expect(response.body.salt).toBe(undefined);
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

  it('should return scrubbed user object', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;

    response = await request(app).get(`/user?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(username);
    expect(response.body.salt).toBe(undefined);
  });
});

describe('POST /user/follow_community', () => {
  useMongoTestWrapper();

  it('should 400 when id missing', async () => {
    const app = await createTestApp();
    const id = '';

    let response = await request(app).post('/user/follow_community').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/user/follow_community').send({ id });
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id invalid', async () => {
    const app = await createTestApp();
    const id = 'fakeCommunity';

    let response = await request(app).post('/user/follow_community').send({ id });
    expect(response.statusCode).toBe(404);
  });

  it('should 401 when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').send({ id: community._id });
    expect(response.statusCode).toBe(401);
  });

  it('should send community and update User and Community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(community._id);

    user = await User.findById(user._id);
    expect(user.followed_communities.length).toBe(1);
    expect(user.followed_communities.includes(community._id)).toBe(true);

    community = await Community.findById(community._id);
    expect(community.followers.length).toBe(1);
    expect(community.followers.includes(user._id)).toBe(true);
  });

  it('should 409 when already following', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(409);
  });
});

describe('POST /user/unfollow_community', () => {
  useMongoTestWrapper();

  it('should 400 when id missing', async () => {
    const app = await createTestApp();
    const id = '';

    let response = await request(app).post('/user/unfollow_community').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/user/unfollow_community').send({ id });
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id invalid', async () => {
    const app = await createTestApp();
    const id = 'fakeCommunity';

    let response = await request(app).post('/user/unfollow_community').send({ id });
    expect(response.statusCode).toBe(404);
  });

  it('should 401 when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/unfollow_community').send({ id: community._id });
    expect(response.statusCode).toBe(401);
  });

  it('should send community and update User and Community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);

    user = await User.findById(user._id);
    expect(user.followed_communities.length).toBe(1);
    expect(user.followed_communities.includes(community._id)).toBe(true);

    community = await Community.findById(community._id);
    expect(community.followers.length).toBe(1);
    expect(community.followers.includes(user._id)).toBe(true);

    response = await request(app).post('/user/unfollow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);
    expect(community._id.equals(response.body._id)).toBe(true);

    user = await User.findById(user._id);
    expect(user.followed_communities.length).toBe(0);

    community = await Community.findById(community._id);
    expect(community.followers.length).toBe(0);
  });

  it('should 409 when not following', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/unfollow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(409);
  });
});

describe('GET /user/is_following_community', () => {
  useMongoTestWrapper();

  it('should 400 when id missing', async () => {
    const app = await createTestApp();
    const id = '';

    let response = await request(app).get('/user/is_following_community');
    expect(response.statusCode).toBe(400);

    response = await request(app).get(`/user/is_following_community?id=${id}`);
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id invalid', async () => {
    const app = await createTestApp();
    const id = 'fakeCommunity';

    let response = await request(app).get(`/user/is_following_community?id=${id}`);
    expect(response.statusCode).toBe(404);
  });

  it('should 401 when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).get(`/user/is_following_community?id=${community._id}`);
    expect(response.statusCode).toBe(401);
  });

  it('should send following status', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    let user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/user/is_following_community?id=${community._id}`).set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);

    response = await request(app).post('/user/unfollow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/user/is_following_community?id=${community._id}`).set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(false);
  });
});

describe('GET /user/followed_communities', () => {
  useMongoTestWrapper();

  it('should 400 when id not provided', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/user/followed_communities');
    expect(response.statusCode).toBe(400);
  });

  it('should 404 when id not real', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/user/followed_communities?id=fake');
    expect(response.statusCode).toBe(404);
  });

  it('should return community object array object', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const id = response.body._id;
    const cookie = response.headers['set-cookie'];

    response = await request(app).get(`/user/followed_communities?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);

    const name = 'name';
    const description = 'description';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [id] });
    expect(response.statusCode).toBe(200);
    let community = response.body;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community._id });
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/user/followed_communities?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(community._id);
  });
});

describe('POST /change_password', () => {
  useMongoTestWrapper();

  it('should 401 when not logged in', async () => {
    const app = await createTestApp();

    let response = await request(app).post(`/change_password`).send({});
    expect(response.statusCode).toBe(401);
  });

  it('should 400 when args missing', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    response = await request(app).post(`/change_password`).set('Cookie', cookie).send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post(`/change_password`).set('Cookie', cookie).send({ old_password: password });
    expect(response.statusCode).toBe(400);

    response = await request(app).post(`/change_password`).set('Cookie', cookie).send({ new_password: password });
    expect(response.statusCode).toBe(400);
  });

  it('should 401 when old password is incorrect', async () => {
    const username = 'username';
    const password = 'password';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    response = await request(app)
      .post(`/change_password`)
      .set('Cookie', cookie)
      .send({ new_password: 'cool', old_password: 'nope' });
    expect(response.statusCode).toBe(401);
  });

  it('should update the password', async () => {
    const username = 'username';
    const password = 'password';
    const new_password = 'password2';
    const app = await createTestApp();

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    let user = response.body;
    const cookie = response.headers['set-cookie'];

    response = await request(app)
      .post(`/change_password`)
      .set('Cookie', cookie)
      .send({ new_password, old_password: password });
    expect(response.statusCode).toBe(200);

    response = await request(app).delete(`/logout`).set('Cookie', cookie);
    expect(response.statusCode).toBe(200);

    response = await request(app).post(`/login`).send({ username, password });
    expect(response.statusCode).toBe(401);

    response = await request(app).post(`/login`).send({ username, password: new_password });
    expect(response.statusCode).toBe(200);
  });
});
