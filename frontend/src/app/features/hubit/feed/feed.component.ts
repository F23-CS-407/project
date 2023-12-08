import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  @Input() userId!: string;
  private backendAddr: string = "/api"; 
  posts: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Fetch posts for the user's feed from the backend
    this.fetchUserFeed(this.userId);
  }

  fetchUserFeed(userId: string) {
    const apiUrl = `${this.backendAddr}/feed`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: feedResponse => {
        this.posts = feedResponse;
        console.log(this.posts);
      },
      error: error => {
        console.error(error);
      }
    });
  }
}