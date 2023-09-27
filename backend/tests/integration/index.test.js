import request from "supertest"
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose } from 'mongoose';

import createApp from "../../src/app.js";

describe("Integration Testing Environment", () => {
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

    it("should run tests", () => {
        expect(3 + 5).toBe(8);
    })

    it("should send requests and get responses", async () => {
        const response = await request(await createApp()).get("/auth_test")
        expect(response.statusCode).toBe(200);
    })
})
