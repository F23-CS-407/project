import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose } from 'mongoose';

import fs from 'fs';

export default function useMongoTestWrapper() {
  let mongoServer;
  let con;

  beforeEach(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      con = await mongoose.connect(mongoServer.getUri(), {});
      process.env.MONGO_URL = mongoServer.getUri();

      fs.mkdirSync('/usr/backend/uploads');
    } catch {
      return;
    }
  });

  afterEach(async () => {
    try {
      await mongoose.disconnect();
      await con.disconnect();
      await mongoServer.stop();

      fs.rmdirSync('/usr/backend/uploads', { recursive: true });
    } catch {
      return;
    }
  });
}
