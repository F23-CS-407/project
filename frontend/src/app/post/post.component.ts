import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  private backend_addr : string = "http://localhost:8080/api";
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  community_id: string = "";
  community_posts: string = "";

  constructor(private http: HttpClient) {
    this.community_id = this.urlParams.get('id') as string;
  }

  show_posts() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/community/posts?community="+this.community_id, options).subscribe({
      next: info_response => {          // On success
        this.community_posts = JSON.stringify(info_response);
      }, 
      error: error => {         // On fail
        console.log(error);
      }});
  }
}
