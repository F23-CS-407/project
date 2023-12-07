import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  @Input() userId!: string;
  private backendAddr: string = "http://localhost:8080/api";
  posts: any[] = [];

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    // Fetch posts for the user's feed from the backend
    this.fetchUserFeed(this.userId);
  }

  fetchUserFeed(userId: string, page?: number, count?: number) {
    let apiUrl = `${this.backendAddr}/feed?id=${userId}`;
    
    if (page !== undefined && count !== undefined) {
        apiUrl += `&page=${page}&count=${count}`;
    }

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
