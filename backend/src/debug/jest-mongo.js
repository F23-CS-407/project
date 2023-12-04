import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose } from 'mongoose';

import fs from 'fs';

export default function useMongoTestWrapper() {
  let mongoServer;
  let con;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await mongoose.connect(mongoServer.getUri(), {});
    process.env.MONGO_URL = mongoServer.getUri();

    fs.mkdirSync('/usr/backend/uploads');
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await con.disconnect();
    await mongoServer.stop();

    fs.rmSync('/usr/backend/uploads', { recursive: true });
  });
}
