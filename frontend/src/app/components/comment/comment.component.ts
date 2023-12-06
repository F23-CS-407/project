import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../../../models/Comment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent {
  @Input({ required: true }) comment!: Comment;
  @Input() viewing_user_id: string = '';
  @Input({ required: true }) deleteComment!: (id: string) => void;
  @Input({ required: true }) http!: HttpClient;

  get creatorId(): string {
    return this.comment.creator.get_id();
  }

  get creatorUsername(): string | undefined {
    return this.comment.creator.get_username();
  }
}
