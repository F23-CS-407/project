import express from 'express';
import session from 'express-session';
import body_parser from 'body-parser';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';


import { verify, hash } from './authentication/utils.js';
import { User } from './authentication/schemas.js';
import { createUser, login, logout, auth_test } from "./authentication/endpoints.js";

const MONGO_STAGE = process.env.MONGO_STAGE
const MONGO_URL = process.env.MONGO_URL

// set up express and define app
const app = express();

app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }));

// connect to mongodb
let connection_url = `mongodb://${MONGO_URL}:27017/${MONGO_STAGE}`;
mongoose.set('strictQuery', false);
await mongoose.connect(connection_url);
const db = mongoose.connection;

// set up sessions and add them to the app
app.use(session({
    secret: 'hubit secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongoUrl: db.client.s.url })
}));

// set up passport
passport.use(new LocalStrategy(verify));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});
    
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());

// auth endpoints
app.post('/login', login);
app.post('/logout', logout);
app.post('/create_user', createUser)
app.get('/auth_test', auth_test)

// start the app
const server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
})
