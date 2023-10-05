import mongoose from 'mongoose';
import { Community } from "./schemas.js";
import { User } from "../authentication/schemas.js";
import { Post } from "./posts/schemas.js";

// Community, requires community name, description, and at least one valid mod
// The mod array  must comprise of correct Object IDs for User objects.
export async function createCommunity(req, res) {
    const req_name = req.body.name
    const req_desc = req.body.description
    const req_mods = req.body.mods;
  
    // Must have username and password
    if(!req_name){
        res.status(400).send('Community name required');
        return;
    }

    if(!req_desc){
        res.status(400).send('Community description required');
        return;
    }

    if(!req.body.mods || req.body.mods.length < 1){
      res.status(400).send('At least one mod is required');
      return;
    }

    // Validate ObjectId values in the mods array
    const isValidMods = req_mods.every((modId) => mongoose.Types.ObjectId.isValid(modId));

    if (!isValidMods) {
        res.status(400).send('Invalid ObjectId in mods array');
        return;
    }
  
    //Determine if community name already exists
    const comm = await Community.findOne({ name: req_name });
    if (comm) {
      res.status(409).send('A community with this name already exists');
      return;
    }
  
    // Create community
    try{
      const new_comm = new Community({
        name: req_name,
        description: req_desc,
        mods: req_mods
      });
      await new_comm.save();
      res.status(200).json(new_comm);
    }
    catch(err){

    }
}

   //Finds a community matching the queried name. May want to use a select statement in the future to change which data gets sent back.
export async function query_communities(req, res){

    const community_name = req.query.name

    Community.find({name: { $regex: new RegExp(`${community_name}.*`, 'i') } }, (err, communities) => {
      if(err){
        res.status(400).send('Internal Server Error');
        return;
      }
      res.status(200).json(communities);
    })
}

export async function query_users(req, res){

    const query_user = req.query.username;

    User.find({ username: { $regex: new RegExp(`${query_user}.*`, 'i') } }, (err, users) => {
        if (err) {
          res.status(400).send('Internal Server Error');
          return;
        }

        //Sorts users by length.
        users.sort((a, b) => a.username.length - b.username.length);
        res.status(200).json(users);
    });
  }

  export async function search_single_user(req, res){

    User.findOne({username: req.query.username}, (err, user) => {
      if(err){
        res.status(400).send('Internal Server Error');
        return;
      }
      res.status(200).json(user);
    });

  }

  //Needs to know what user is making the post and what community it is being made in.
  export async function postInCommunity(req, res){
    const post = req.post;
    const post_comm = req.community;
    const post_user = req.user;

    post.created_date = new Date(Date.UTC());

    if(!post){
      res.status(400).send('No post data');
      return;
    }

    if(!post.content){
      res.status(400).send('There is no content in the post');
      return;
    }

    if(!post_comm){
      res.status(400).send('A post must exist in a community');
      return;
    }

    if(!post_user){
      res.status(400).send('A user must make a post');
      return;
    }

    const new_post = new Post({
      content: req.post.content,
      created_by: post_user,
      tags: req.post.tags,
      liked_by: [],
      comments: [],
    });

    await new_post.save();
    
    post_comm.posts.push(new_post);
    await post_comm.save();
    res.status(200).json(new_post);
  }