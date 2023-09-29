import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import { verify, serializeUser, deserializeUser } from './utils.js';
import { createUser, login, logout } from './endpoints.js';

export default function use_authentication(app) {
  // set up sessions and add them to the app
  app.use(
    session({
      secret: 'hubit secret',
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({ mongoUrl: mongoose.connection.client.s.url }),
    }),
  );

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

  return app;
}
