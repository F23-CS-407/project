import request from "supertest"
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose } from 'mongoose';

import createApp from "../../../src/app.js";
import { User } from "../../../src/authentication/schemas.js";
import { hash } from "../../../src/authentication/utils.js";

describe("POST /create_user", () => {
    let mongoServer;
    let con;
  
    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        con = await mongoose.connect(mongoServer.getUri(), {});
        process.env.MONGO_URL = mongoServer.getUri()
    });
  
    afterEach(async () => {
      await mongoose.disconnect()
      if (con) {
        await con.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    });  

    it("should 400 without username or password", async () => {
        const app = await createApp()

        let response = await request(app).post("/create_user").send({})
        expect(response.statusCode).toBe(400);

        response = await request(app).post("/create_user").send({username: "hi"})
        expect(response.statusCode).toBe(400);

        response = await request(app).post("/create_user").send({password: "hi"})
        expect(response.statusCode).toBe(400);
    })

    it("should 409 when user exists", async () => {
        const username = "username"
        const password = "password"

        await (new User({username, password_hash: hash(password)})).save()
        const response = await request(await createApp()).post("/create_user").send({username, password})
        expect(response.statusCode).toBe(409);
    })

    it("should give user object on sucess", async () => {
        const username = "username"
        const password = "password"

        const response = await request(await createApp()).post("/create_user").send({username, password})
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(username)
    })

    it("should be authenticated on success", async () => {
        const username = "username"
        const password = "password"
        const app = await createApp()

        let response = await request(app).get("/auth_test")
        expect(response.statusCode).toBe(401)

        response = await request(app).post("/create_user").send({username, password})
        expect(response.statusCode).toBe(200);
        const cookie = response.headers["set-cookie"]
        expect(cookie).toBeTruthy()

        response = await request(app).get("/auth_test").set("Cookie", cookie)
        expect(response.statusCode).toBe(200)
        expect(response.text).toBe(username)
    })
})

describe("POST /login", () => {
    let mongoServer;
    let con;
  
    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        con = await mongoose.connect(mongoServer.getUri(), {});
        process.env.MONGO_URL = mongoServer.getUri()
    });
  
    afterEach(async () => {
      await mongoose.disconnect()
      if (con) {
        await con.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    });  

    it("should 400 without username or password", async () => {
        const app = await createApp()

        let response = await request(app).post("/login").send({})
        expect(response.statusCode).toBe(400);

        response = await request(app).post("/login").send({username: "hi"})
        expect(response.statusCode).toBe(400);

        response = await request(app).post("/login").send({password: "hi"})
        expect(response.statusCode).toBe(400);
    })

    it("should 401 when user not found", async () => {
        const response = await request(await createApp()).post("/login").send({username: "no", password: "nope"})
        expect(response.statusCode).toBe(401);
    })

    it("should 401 when password does not match", async () => {
        const username = "username"
        const password = "password"
        const not_password = "boohoo"

        await (new User({username, password_hash: hash(password)})).save()
        const response = await request(await createApp()).post("/login").send({username, password: not_password})
        expect(response.statusCode).toBe(401);
    })

    it("should give user object on username and password match", async () => {
        const username = "username"
        const password = "password"

        await (new User({username, password_hash: hash(password)})).save()
        const response = await request(await createApp()).post("/login").send({username, password})
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(username)
    })

    it("should be authenticated on success", async () => {
        const username = "username"
        const password = "password"
        const app = await createApp()

        let response = await request(app).get("/auth_test")
        expect(response.statusCode).toBe(401)

        await (new User({username, password_hash: hash(password)})).save()
        response = await request(app).post("/login").send({username, password})
        expect(response.statusCode).toBe(200);
        const cookie = response.headers["set-cookie"]
        expect(cookie).toBeTruthy()

        response = await request(app).get("/auth_test").set("Cookie", cookie)
        expect(response.statusCode).toBe(200)
        expect(response.text).toBe(username)
    })
})

describe("DELETE /logout", () => {
    let mongoServer;
    let con;
  
    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        con = await mongoose.connect(mongoServer.getUri(), {});
        process.env.MONGO_URL = mongoServer.getUri()
    });
  
    afterEach(async () => {
      await mongoose.disconnect()
      if (con) {
        await con.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    });

    it("should 401 when not authenticated", async () => {
        const username = "username"
        const password = "password"
        const app = await createApp()

        let response = await request(app).delete("/logout")
        expect(response.statusCode).toBe(401)
    })

    it("should logout when authenticated", async () => {
        const username = "username"
        const password = "password"
        const app = await createApp()

        let response = await request(app).get("/auth_test")
        expect(response.statusCode).toBe(401)

        await (new User({username, password_hash: hash(password)})).save()
        response = await request(app).post("/login").send({username, password})
        expect(response.statusCode).toBe(200);
        const cookie = response.headers["set-cookie"]
        expect(cookie).toBeTruthy()

        response = await request(app).get("/auth_test").set("Cookie", cookie)
        expect(response.statusCode).toBe(200)

        response = await request(app).delete("/logout").set("Cookie", cookie)
        expect(response.statusCode).toBe(200)

        response = await request(app).get("/auth_test")
        expect(response.statusCode).toBe(401)
    })
})
