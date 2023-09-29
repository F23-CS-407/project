import { verify, hash } from '../../../src/authentication/utils';
import { User } from '../../../src/authentication/schemas';

import useMongoTestWrapper from '../../../src/debug/jest-mongo';

describe('Verify', () => {
  useMongoTestWrapper();

  const verifyCb = (err, user) => {
    return user;
  };

  it('should fail when user not found', async () => {
    expect(await verify('not_user', 'not_password', verifyCb)).toBe(false);
  });

  it('should fail when password is incorrect', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';
    const not_password = 'boohoo';

    await new User({ username, password_hash: hash(password + salt), salt }).save();
    expect(await verify(username, not_password, verifyCb)).toBe(false);
  });

  it('should return user object when username and password match', async () => {
    const username = 'username';
    const password = 'password';
    const salt = 'salt';

    const user_object = new User({ username, password_hash: hash(password + salt), salt });
    await user_object.save();

    const result = await verify(username, password, verifyCb);
    expect(typeof result).toEqual(typeof User());
    expect(result.username).toBe(username);
  });
});
