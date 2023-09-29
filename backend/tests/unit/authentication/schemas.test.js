import { User } from '../../../src/authentication/schemas.js';

import useMongoTestWrapper from '../../../src/debug/jest-mongo.js';

describe("Authentication Schemas", () => {
    useMongoTestWrapper()

    it("should create users", () => {
        const username = "test_username"
        const password_hash = "test_password_hash"

        const test_user = new User({username: username, password_hash: password_hash});

        expect(test_user.username).toBe(username)
        expect(test_user.password_hash).toBe(password_hash)
    })

    it("should save users to database", async () => {
        const username = "test_username"
        const password_hash = "test_password_hash"

        const test_user = new User({username: username, password_hash: password_hash});
        await test_user.save()

        const db_users = await User.find()

        expect(db_users.length).toBe(1)

        const db_user = db_users[0]

        expect(db_user.username).toBe(username)
        expect(db_user.password_hash).toBe(password_hash)
    })


    it("should find users by username", async () => {
        const username1 = "test_username1"
        const password_hash1 = "test_password_hash1"
        const username2 = "test_username2"
        const password_hash2 = "test_password_hash2"

        const test_user1 = new User({username: username1, password_hash: password_hash1});
        await test_user1.save()
        const test_user2 = new User({username: username2, password_hash: password_hash2});
        await test_user2.save()

        const db_users = await User.find()
        expect(db_users.length).toBe(2)

        const db_user1 = await User.find({username: username1})
        expect(db_user1.length).toBe(1)

        const db_user1obj = db_user1[0]
        expect(db_user1obj.username).toBe(username1)
        expect(db_user1obj.password_hash).toBe(password_hash1)
    })
})
