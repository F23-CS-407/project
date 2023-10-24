import mongoose from 'mongoose';
import { deleteAllUserData } from './utils.js';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: String,
    password_hash: String,
    salt: String,
    description: String,
    mod_for: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    methods: {
      // removes private and unnecesary information
      scrub() {
        this.password_hash = undefined;
        this.salt = undefined;

        return this;
      },

      // delete this object and all child components
      async deleteRecursive(cb) {
        return await deleteAllUserData(this.username, cb);
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
