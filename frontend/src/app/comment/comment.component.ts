import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../../models/Comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent {
  @Input({required: true}) comment!: Comment;
}
