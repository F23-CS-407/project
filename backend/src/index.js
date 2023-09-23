import express from 'express';
import session from 'express-session';
import body_parser from 'body-parser';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import mongoose from 'mongoose';

import { verify, hash } from './authentication/utils.js';
import { User } from './authentication/schemas.js';
import { createUser } from "./authentication/endpoints.js";

const MONGO_STAGE = process.env.MONGO_STAGE
const MONGO_URL = process.env.MONGO_URL

// set up express and define app
const app = express();

app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }));

// // set up sessions and add them to the app
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: true }
//   }));

// // set up passport
// passport.use(new LocalStrategy(verify));

// passport.serializeUser(function(user, cb) {
//     process.nextTick(function() {
//         return cb(null, {
//         id: user.id,
//         username: user.username,
//         picture: user.picture
//     });
// });
// });
    
// passport.deserializeUser(function(user, cb) {
//     process.nextTick(function() {
//         return cb(null, user);
//     });
// });

// assign endpoints to the app
app.get('/test', (req, res, next) => {
    res.send("test")
})

app.post("/create_user", createUser)

// connect to mongodb
let connection_url = `mongodb://${MONGO_URL}:27017/${MONGO_STAGE}`;
mongoose.set('strictQuery', false);
await mongoose.connect(connection_url);

// start the app
const server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
})
