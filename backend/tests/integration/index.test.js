import request from "supertest"

import createTestApp from "../../src/debug/test-app.js";
import useMongoTestWrapper from "../../src/debug/jest-mongo.js";

describe("Integration Testing Environment", () => {
    useMongoTestWrapper() 

    it("should run tests", () => {
        expect(3 + 5).toBe(8);
    })

    it("should send requests and get responses", async () => {
        const response = await request(await createTestApp()).get("/auth_test")
        expect(response.statusCode).toBe(401);
    })
})
