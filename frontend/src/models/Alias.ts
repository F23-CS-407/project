import { User } from './User';
import { Community } from './Community';

export class Alias {
  username: string = '';
  id: string = '-1';
  //profile_pic: Upload = ?           // We might not need this because calling backend for user by user_id should return that data
  bio: string = '';
  user: User;
  for_community?: Community;
  community_username?: string;

  constructor(user: User, community?: Community) {
    this.user = user;
    this.for_community = community;
  }
}
