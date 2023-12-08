import { User } from './User';
import { Alias } from './Alias';
import { Comment } from './Comment';

export class Post {
  kind: string = "";
  id: string = "-1";                        // Not sure what type ID is
  created_by: Alias;
  content: String = "POST_CONTENT";
  edited_by: User[] = [];
  created_date: Date = new Date(2023, 9, 13, 11, 58, 57);         // 11:58:57 September 13, 2023
  last_edited: Date = new Date(2023, 9, 13, 11, 59, 58);
  parent: number = 122;
  parent_kind: string = "";
  tags: string[] = ['TEST_TAG'];
  // This is probably unnecessary. We would only need        likes: number = 0;
  liked_by: User[] = [];
  comments: Comment[] = [];
  category: String = ''

  // This is useful for overloading
  //constructor(...args: any[]) {
  constructor(alias: Alias){
    // Argument is (type) Alias
    this.created_by = alias;
  }
}
