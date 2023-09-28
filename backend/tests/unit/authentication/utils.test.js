import { mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { verify, hash } from '../../../src/authentication/utils';
import { User } from '../../../src/authentication/schemas';

describe("Verify", () => {
    const verifyCb = (err, user) => { return user }
    let con;
    let mongoServer;
  
    beforeEach(async () => {
      mongoServer = await MongoMemoryServer.create();
      con = await mongoose.connect(mongoServer.getUri(), {});
    });
  
    afterEach(async () => {
      if (con) {
        await con.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    }); 

    it("should fail when user not found", async () => {
        expect(await verify("not_user", "not_password", verifyCb)).toBe(false)
    })

    it("should fail when password is incorrect", async () => {
        const username = "username"
        const password = "password"
        const not_password = "boohoo"

        await (new User({username, password_hash: hash(password)})).save()
        expect(await verify(username, not_password, verifyCb)).toBe(false)
    })

    it("should return user object when username and password match", async () => {
        const username = "username"
        const password = "password"

        const user_object = new User({username, password_hash: hash(password)})
        await user_object.save()

        const result = await verify(username, password, verifyCb)
        expect(typeof result).toEqual(typeof User())
        expect(result.username).toBe(username)
    })
})
