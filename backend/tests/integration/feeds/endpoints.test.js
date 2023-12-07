import request from 'supertest';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

import { Community } from '../../../src/communities/schemas.js';
import { User } from '../../../src/authentication/schemas.js';
import { Post } from '../../../src/communities/posts/schemas.js';
import { Comment } from '../../../src/communities/posts/comments/schemas.js';

describe('GET /feed', () => {
  useMongoTestWrapper();

  it('should fail if not logged in', async () => {
    const app = await createTestApp();

    let response = await request(app).get('/feed');
    expect(response.statusCode).toBe(401);
  });

  it('should fail if params used but not both', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).get('/feed?count=0').set('Cookie', cookie);
    expect(response.statusCode).toBe(400);

    response = await request(app).get('/feed?page=0').set('Cookie', cookie);
    expect(response.statusCode).toBe(400);
  });

  it('should return empty if no followed communities', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app).get('/feed').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.toString() == [].toString()).toBe(true);
  });

  it('should return populated posts only from followed communities', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board });
    expect(response.statusCode).toBe(200);
    let post1 = response.body._id;

    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board });
    expect(response.statusCode).toBe(200);
    let post2 = response.body._id;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community });
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: 'com2', description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community2 = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community: community2 });
    expect(response.statusCode).toBe(200);
    let board2 = response.body._id;

    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board: board2 });
    expect(response.statusCode).toBe(200);
    let post3 = response.body._id;

    response = await request(app).get('/feed').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]._id).toBe(post2);
    expect(response.body[0].parent._id).toBe(board);
    expect(response.body[0].parent.parent._id).toBe(community);
    expect(response.body[1]._id).toBe(post1);
  });

  it('should paginate', async () => {
    const app = await createTestApp();

    const username = 'username';
    const password = 'password';
    const name = 'name';
    const description = 'description';

    let response = await request(app).post('/create_user').send({ username, password });
    const cookie = response.headers['set-cookie'];
    expect(response.statusCode).toBe(200);
    const user = response.body;

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name, description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    const post = { content: 'Test' };
    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board });
    expect(response.statusCode).toBe(200);
    let post1 = response.body._id;

    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board });
    expect(response.statusCode).toBe(200);
    let post2 = response.body._id;

    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board });
    expect(response.statusCode).toBe(200);
    let post3 = response.body._id;

    response = await request(app).post('/user/follow_community').set('Cookie', cookie).send({ id: community });
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie)
      .send({ name: 'com2', description, mods: [user._id] });
    expect(response.statusCode).toBe(200);
    const community2 = response.body._id;

    response = await request(app).post('/board').set('Cookie', cookie).send({ name, community: community2 });
    expect(response.statusCode).toBe(200);
    let board2 = response.body._id;

    response = await request(app).post('/board/post').set('Cookie', cookie).send({ post, board: board2 });
    expect(response.statusCode).toBe(200);
    let post4 = response.body._id;

    response = await request(app).get('/feed?page=0&count=2').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]._id).toBe(post3);
    expect(response.body[1]._id).toBe(post2);

    response = await request(app).get('/feed?page=1&count=2').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(post1);

    response = await request(app).get('/feed?page=2&count=2').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);

    response = await request(app).get('/feed?page=0&count=0').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(3);

    response = await request(app).get('/feed?page=-1&count=-1').set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(3);
  });
});
