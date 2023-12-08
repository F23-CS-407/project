import { User } from './User';

export class Comment {
  parent_comment?: Comment = undefined;
  children_comments: Comment[] = [];
  creator: User;
  text: string = '';
  id: string = '';

  constructor(creator: User) {
    this.creator = creator;
  }
}
