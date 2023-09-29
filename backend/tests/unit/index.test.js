import { mongoose } from 'mongoose';

import useMongoTestWrapper from '../../src/debug/jest-mongo';

describe('Unit Testing Environment', () => {
  useMongoTestWrapper();

  it('should run tests', () => {
    expect(3 + 5).toBe(8);
  });

  it('should use a test database', async () => {
    const state = mongoose.connection.readyState;
    const connectedState = 1;

    expect(state).toBe(connectedState);
  });
});
