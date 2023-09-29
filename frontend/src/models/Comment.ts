import { User } from './User';

export class Comment {
    parent_comment?: Comment = undefined;
    children_comments: Comment[] = [];
    creator?: User;
    text: string = "";
    id: number = -1;

    constructor() {
        
    }
}