import request from 'supertest';

import createTestApp from '../../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../../src/debug/jest-mongo.js';
import { Community } from '../../../../src/communities/schemas.js';
import { Board } from '../../../../src/communities/boards/schemas.js';

describe('POST /create_board', () => {
  useMongoTestWrapper();

  it('should fail with missing body params', async () => {
    const app = await createTestApp();
    const name = 'board';
    const community = 'fakeId';

    let response = await request(app).post('/create_board').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/create_board').send({ name });
    expect(response.statusCode).toBe(400);

    response = await request(app).post('/create_board').send({ community });
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid community', async () => {
    const app = await createTestApp();
    const name = 'board';
    const community = 'fakeId';

    let response = await request(app).post('/create_board').send({ name, community });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

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
    const community = response.body._id;

    response = await request(app).post('/create_board').send({ name, community });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when not mod', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2 = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(403);
  });

  it('should return board and update community', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

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
    let community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;
    expect(board.name).toBe(name);
    expect(board.parent).toBe(community);

    community = await Community.findById(community);
    expect(community.boards.length).toBe(1);
    expect(community.boards.includes(board._id)).toBe(true);
  });

  it('should fail when board name is already in use', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

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
    let community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(409);
  });
});

describe('DELETE /board', () => {
  useMongoTestWrapper();

  it('should fail with missing board', async () => {
    const app = await createTestApp();
    const board = '';

    let response = await request(app).delete('/board').send({});
    expect(response.statusCode).toBe(400);

    response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(400);
  });

  it('should fail with invalid board', async () => {
    const app = await createTestApp();
    const board = 'board';

    let response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(404);
  });

  it('should fail when not logged in', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

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
    const community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    response = await request(app).delete('/board').send({ board });
    expect(response.statusCode).toBe(401);
  });

  it('should fail when not mod', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

    let response = await request(app).post('/create_user').send({ username, password });
    expect(response.statusCode).toBe(200);
    const cookie = response.headers['set-cookie'];
    const user = response.body;

    response = await request(app).post('/create_user').send({ username: 'wow', password });
    expect(response.statusCode).toBe(200);
    const cookie2 = response.headers['set-cookie'];
    const user2 = response.body;

    const comm_name = 'test community';
    const comm_desc = 'a test community';
    response = await request(app)
      .post('/create_community')
      .set('Cookie', cookie2)
      .send({ name: comm_name, description: comm_desc, mods: [user2._id] });
    expect(response.statusCode).toBe(200);
    const community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie2).send({ name, community });
    expect(response.statusCode).toBe(200);
    let board = response.body._id;

    response = await request(app).delete('/board').set('Cookie', cookie).send({ board });
    expect(response.statusCode).toBe(403);
  });

  it('should delete the board and follow procedure', async () => {
    const app = await createTestApp();
    const username = 'username';
    const password = 'password';
    const name = 'board';

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
    let community = response.body._id;

    response = await request(app).post('/create_board').set('Cookie', cookie).send({ name, community });
    expect(response.statusCode).toBe(200);
    const board = response.body;
    expect(board.name).toBe(name);
    expect(board.parent).toBe(community);
    expect((await Board.find()).length).toBe(1);

    community = await Community.findById(community);
    expect(community.boards.length).toBe(1);
    expect(community.boards.includes(board._id)).toBe(true);

    response = await request(app).delete('/board').set('Cookie', cookie).send({ board: board._id });
    expect(response.statusCode).toBe(200);

    expect((await Board.find()).length).toBe(0);
    community = await Community.findById(community);
    expect(community.boards.length).toBe(0);

    // TODO delete board deletes posts
  });
});
