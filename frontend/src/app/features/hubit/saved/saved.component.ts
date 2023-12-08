import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { Post } from '../../../../models/Post';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent implements OnInit {
  savedPosts: string[] = [];
  private backend_addr: string = '/api';

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user && user.saved_posts) {
        console.log('Saved posts:', user.saved_posts);
        this.savedPosts = user.saved_posts;
      }
    });
  }

  unsavePost(postId: string): void {
    this.userService.unsavePost(postId).subscribe({
      next: () => {
        this.savedPosts = this.savedPosts.filter(id => id !== postId);
      },
      error: (error) => {
        console.error('Error unsaving post:', error);
      }
    });
  }
}
