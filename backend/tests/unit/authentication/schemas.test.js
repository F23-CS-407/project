import { mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { User } from '../../../src/authentication/schemas.js';

describe("Authentication Schemas", () => {
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

    it("should create users", () => {
        const username = "test_username"
        const password_hash = "test_password_hash"
        const salt = "salty"

        const test_user = new User({username: username, password_hash: password_hash, salt});

        expect(test_user.username).toBe(username)
        expect(test_user.password_hash).toBe(password_hash)
        expect(test_user.salt).toBe(salt)
    })

    it("should save users to database", async () => {
        const username = "test_username"
        const password_hash = "test_password_hash"
        const salt = "salty"

        const test_user = new User({username: username, password_hash: password_hash, salt});
        await test_user.save()

        const db_users = await User.find()

        expect(db_users.length).toBe(1)

        const db_user = db_users[0]

        expect(db_user.username).toBe(username)
        expect(db_user.password_hash).toBe(password_hash)
        expect(db_user.salt).toBe(salt)
    })


    it("should find users by username", async () => {
        const username1 = "test_username1"
        const password_hash1 = "test_password_hash1"
        const salt1 = "salty1"
        const username2 = "test_username2"
        const password_hash2 = "test_password_hash2"
        const salt2 = "salty2"

        const test_user1 = new User({username: username1, password_hash: password_hash1, salt: salt1});
        await test_user1.save()
        const test_user2 = new User({username: username2, password_hash: password_hash2, salt: salt2});
        await test_user2.save()

        const db_users = await User.find()
        expect(db_users.length).toBe(2)

        const db_user1 = await User.find({username: username1})
        expect(db_user1.length).toBe(1)

        const db_user1obj = db_user1[0]
        expect(db_user1obj.username).toBe(username1)
        expect(db_user1obj.password_hash).toBe(password_hash1)
        expect(db_user1obj.salt).toBe(salt1)
    })
})
