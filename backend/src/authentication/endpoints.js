import { hash } from './utils.js';
import { User } from './schemas.js';

// Create user, body must include username and password fields
export const createUser = async (req, res, next) => {
    const requested_username = req.body.username
    const requested_password = req.body.password

    // Must have username and password
    if (!requested_username || !requested_password) {
        res.send("Username or password missing", 400)
        return
    }

    // Check if already exists
    const users = await User.find({username: requested_username});
    if (users.length > 0) {
        res.send("Username taken", 409)
        return
    }
    
    // Create user
    const new_user = new User({username: requested_username, password_hash: hash(requested_password)});
    await new_user.save();
    res.send(new_user)
}