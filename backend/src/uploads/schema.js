import mongoose from 'mongoose';
import fs from 'fs';
import { User } from '../authentication/schemas.js';

const { Schema } = mongoose;

const UploadReceiptSchema = new Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    filename: String,
    url: String,
  },
  {
    methods: {
      async deleteRecursive() {
        // delete the file
        fs.unlinkSync(`/usr/backend/uploads/${this.filename}`);

        // remove from user
        let user = await User.findById(this.creator);
        if (user) {
          user.uploads = user.uploads.filter((u) => !u.equals(this._id));
          await user.save();
        }

        // delete object
        await this.delete();
      },
    },
  },
);

export const UploadReceipt = mongoose.model('UploadReceipt', UploadReceiptSchema);
