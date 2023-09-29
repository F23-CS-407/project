import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose } from 'mongoose';

export default function useMongoTestWrapper() {
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
}