import mongoose from 'mongoose';
import { Post } from '../schemas.js';
import { Comment } from './schemas.js';
import { User } from '../../../authentication/schemas.js';

//Needs a post ID in the req body, as well as the commenting user.
export async function new_comment(req, res) {
  const comment = req.body.comment;
  const post_id = req.body.post;

  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }

  const comment_user = req.user._id;

  const created_date = Date.now();

  if (!comment) {
    res.status(400).send({ error: 'No comment data' });
    return;
  }

  if (!comment.content) {
    res.status(400).send({ error: 'There is no content in this comment' });
    return;
  }

  if (!post_id) {
    res.status(400).send({ error: 'A new top level comment requires a post ID' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(post_id)) {
    res.status(400).send({ error: 'Invalid post id' });
    return;
  }

  const new_comment = new Comment({
    content: comment.content,
    children_comments: [],
    created_by: comment_user,
    created_date: created_date,
    parent: post_id,
    parent_ref: 'Post',
  });

  const commented = await new_comment.save();

  //Update the post with the new comment.
  const post = await Post.findOne({ _id: post_id });
  post.comments.push(commented._id);
  await post.save();

  //Update the user with the new comment.
  const user = await User.findById(req.user._id);
  user.comments.push(commented._id);
  await user.save();

  res.status(200).json(commented);
}

export async function deleteComment(req, res, next) {
  const comment_id = req.body.comment;
  if (!comment_id) {
    res.status(400).send('Comment missing');
    return;
  }

  if (!req.isAuthenticated()) {
    res.status(401).send('Not logged in');
    return;
  }
  const user = await User.findById(req.user._id);

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    res.status(404).send({ error: 'Comment not found' });
    return;
  }
  const comment = await Comment.findById(comment_id);

  if (!comment.created_by.equals(user._id)) {
    res.status(403).send('Not creator of comment');
    return;
  }

  await comment.deleteRecursive();
  res.status(200).send('Deleted');
}

export async function getComment(req, res, next) {
  const id = req.query.id;
  if (!id) {
    res.status(400).send({ error: 'id param missing' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({ error: 'Invalid Comment id' });
    return;
  }

  const thisComment = await Comment.findById(id);
  res.status(200).json(thisComment);
}

//TODO, not explicitly required for the first sprint. Will be used for comment children.
export async function new_reply(req, res) {
  return;
}

//Given a post, get all the (top-level) comments.
export async function get_comments_by_post(req, res) {
  const post = req.query.post;

  if (!post) {
    res.status(400).send({ error: 'A post ID is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(post)) {
    res.status(400).send({ error: 'Invalid post ID' });
    return;
  }

  Post.findById(post)
    .populate({
      path: 'comments',
      options: { sort: { created_date: 1 } },
    })
    .exec((err, post) => {
      if (err) {
        res.status(500).send({ error: 'Internal Server Error' });
        return;
      }

      const comments = post.comments;
      res.status(200).json(comments);
    });
}
