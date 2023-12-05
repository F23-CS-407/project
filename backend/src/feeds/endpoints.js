import { User } from '../authentication/schemas.js';
import { Post } from '../communities/posts/schemas.js';

export async function getFeed(req, res) {
  // must be logged in
  if (!req.isAuthenticated()) {
    res.status(401).send({ error: 'not logged in' });
    return;
  }

  // get page and count, if none given return all
  let countQ = req.query.count;
  let pageQ = req.query.page;
  let bothQ = countQ && pageQ;
  if ((countQ || pageQ) && !bothQ) {
    res.status(400).send({ error: 'count and page must both be sent or not at all' });
    return;
  }
  let count = countQ ? countQ : 0;
  let offset = pageQ ? pageQ * count : 0;

  // count and offset need to be non-negative
  if (count < 0 || offset < 0) {
    count = 0;
    offset = 0;
  }

  // get user and followed communities
  let user = await User.findById(req.user._id).populate('followed_communities');

  // if no followed communities send empty
  if (user.followed_communities.length == 0) {
    res.status(200).send([]);
    return;
  }

  // add all communty ids and all board ids
  let included_parent_ids = [];
  for (let comm of user.followed_communities) {
    included_parent_ids.push({ parent: comm._id });
    for (let board of comm.boards) {
      included_parent_ids.push({ parent: board });
    }
  }

  // find Posts that match, populate the community and board, sort date descending
  let results = await Post.find({ $or: included_parent_ids })
    .populate({
      path: 'parent',
      populate: {
        path: 'parent',
        strictPopulate: false,
      },
      strictPopulate: false,
    })
    .sort({ _id: -1 })
    .limit(count)
    .skip(offset);

  res.status(200).send(results);
}
