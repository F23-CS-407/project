import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { Post } from '../../../../models/Post';

@Component({
  selector: 'app-liked',
  templateUrl: './liked.component.html',
  styleUrls: ['./liked.component.css']
})
export class LikedComponent implements OnInit {
  likedPosts: string[] = [];
  private backend_addr: string = '/api';

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user && user.liked_posts) {
        console.log('liked posts:', user.liked_posts);
        this.likedPosts = user.liked_posts;
      }
    });
  }
}
