import passport from 'passport';

import { hash } from './utils.js';
import { User } from './schemas.js';

// Create user, body must include username and password fields
export const createUser = async (req, res, next) => {
    const requested_username = req.body.username
    const requested_password = req.body.password

    // Must have username and password
    if (!requested_username || !requested_password) {
        res.status(400).send("Username or password missing")
        return
    }

    // Check if already exists
    const users = await User.find({username: requested_username});
    if (users.length > 0) {
        res.status(409).send("Username taken")
        return
    }
    
    // Create user
    const new_user = new User({username: requested_username, password_hash: hash(requested_password)});
    await new_user.save();

    // Login
    login(req, res, next)
}

export function login(req, res, next) {
    // Authenticate user, on success send user object
    passport.authenticate('local', function (err, user) {
        req.logIn(user, function() {
            res.status(err ? 500 : 200).send(err ? err : user);
        });
    })(req, res, next)
}

export function logout(req, res, next) {
    // If logged in then destroy session
    if (req.isAuthenticated()) {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.send("Logged out successfully");
        });
        return
    }
    res.status(401).send("Not logged in")
}

export function auth_test(req, res, next) {
    if (req.isAuthenticated()) {
        res.send(`Authenticated, Hello ${req.user.username}!`)
    } else {
        res.send("Not authenticated")
    }
}