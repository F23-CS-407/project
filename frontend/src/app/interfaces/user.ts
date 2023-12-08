export interface UserInterface {
  _id: string;
  username: string;
  bio: string;
  profile_pic: string;
  mod_for: string[];
  comments: any[];
  posts: any[];
  liked_posts: any[];
  followed_communities: any[];
  saved_posts: any[];
  __v: number;
}
