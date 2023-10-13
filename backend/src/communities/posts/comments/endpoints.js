import mongoose from 'mongoose';
import { Post } from '../schemas.js';
import { Comment } from './schemas.js';

//Needs a post ID in the req body, as well as the commenting user.
export async function new_comment(req, res) {
  const comment = req.body.comment;
  const post_id = req.body.post;
  const comment_user = req.body.user;

  const created_date = Date.now();

  if (!comment) {
    res.status(400).send('No comment data');
    return;
  }

  if (!comment.content) {
    res.status(400).send('There is no content in this comment');
    return;
  }

  if (!post_id) {
    res.status(400).send('A new top level comment requires a post ID');
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(post_id)) {
    res.status(400).send('Invalid post id');
    return;
  }

  if (!comment_user) {
    res.status(400).send('No user ID given');
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(comment_user)) {
    res.status(400).send('Invalid User ID');
    return;
  }

  const new_comment = new Comment({
    content: comment.content,
    children_comments: [],
    created_by: comment_user,
    created_date: created_date,
  });

  const commented = await new_comment.save();

  //Update the post with the new comment.
  const post = await Post.findOne({ _id: post_id });

  post.comments.push(commented._id);
  await post.save();

  res.status(200).json(commented);
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
    res.status(400).send('A post ID is required');
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(post)) {
    res.status(400).send('Invalid post ID');
    return;
  }

  Post.findById(post)
    .populate({
      path: 'comments',
      options: { sort: { created_date: 1 } },
    })
    .exec((err, post) => {
      if (err) {
        res.status(400).send('Internal Server Error');
        return;
      }

      const comments = post.comments;
      res.status(200).json(comments);
    });
}
