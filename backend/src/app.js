import express from 'express';
import body_parser from 'body-parser';
import mongoose from 'mongoose';

import use_authentication from './authentication/index.js';

export default async function createApp() {
    const MONGO_URL = process.env.MONGO_URL

    // set up express and define app
    let app = express();
    app.use(body_parser.json())
    app.use(body_parser.urlencoded({ extended: false }));

    // connect to mongodb
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URL);

    // use authentication
    app = use_authentication(app)

    return app
}
