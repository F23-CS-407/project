import { mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe("Unit Testing Environment", () => {
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

    it("should run tests", () => {
        expect(3 + 5).toBe(8);
    })

    it('should use a test database', async () => {
        const state = con.connection.readyState;
        const connectedState = 1
    
        expect(state).toBe(connectedState);
      });
})
