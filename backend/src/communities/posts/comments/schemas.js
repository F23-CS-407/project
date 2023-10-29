import mongoose from 'mongoose';
import { User } from '../../../authentication/schemas.js';
const { Schema } = mongoose;

//Similarly to posts, only has content of type string for now.
const commentSchema = new Schema(
  {
    content: String,
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    parent_ref: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'parent_ref',
    },
    created_date: Date,
  },
  {
    methods: {
      async deleteRecursive() {
        // delete children
        for (const child of this.comments) {
          const child_obj = await Comment.findById(child);
          await child_obj.deleteRecursive();
        }

        // remove from creator's comment array
        const creator = await User.findById(this.created_by);
        creator.comments = creator.comments.filter((comment) => !comment._id.equals(this._id));
        await creator.save();

        // remove from parent
        const parent = (await Comment.findById(this._id).populate('parent')).parent;
        parent.comments = parent.comments.filter((comment) => !comment._id.equals(this._id));
        await parent.save();

        // delete self
        await this.delete();
      },
    },
  },
);

export const Comment = mongoose.model('Comment', commentSchema);
