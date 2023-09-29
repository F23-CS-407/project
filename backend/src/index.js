import mongoose from 'mongoose';

import createApp from './app.js';

const MONGO_URL = process.env.MONGO_URL;

// connect to mongodb
mongoose.set('strictQuery', false);
await mongoose.connect(MONGO_URL);

// start the app
const server = (await createApp()).listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
});
