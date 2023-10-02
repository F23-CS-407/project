import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import { verify, serializeUser, deserializeUser } from './utils.js';
import { createUser, deleteUser, login, logout } from './endpoints.js';

export default function useAuthentication(app) {
  // set up sessions and add them to the app
  app.use(
    session({
      secret: 'hubit secret',
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({ mongoUrl: mongoose.connection.client.s.url }),
    }));
  app.use(
    cors({
      origin: '*',
      methods: ['POST', 'DELETE'],
    }));

  // set up passport
  passport.use(new LocalStrategy(verify));
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
  app.use(passport.initialize());
  app.use(passport.session());

  // auth endpoints
  app.post('/login', login);
  app.delete('/logout', logout);
  app.post('/create_user', createUser);
  app.delete('/delete_user', deleteUser);

  return app;
}
