import request from 'supertest';

import { User } from '../../../src/authentication/schemas.js';
import { hash } from '../../../src/authentication/utils.js';
import { Community } from '../../../src/communities/schemas.js';

import createTestApp from '../../../src/debug/test-app.js';
import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

describe('POST /upload', () => {
  useMongoTestWrapper();

  it('should be here', async () => {
    expect(true).toBe(true);
  });
});
