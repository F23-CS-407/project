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

  community_id?: string;
  community_posts: string = "";

  post_id: string = "post_id";
  post_username: string = "post_username";
  post_community: string = "post_community";
  post_content: string = "post_content";
  like_count: number = 0;

  constructor(private http: HttpClient) {
    this.community_id = this.urlParams.get('comm_id') as string;
    this.post_id = this.urlParams.get('id') as string;
    
  }

  get_post_data() {
    // Query backend for data on post id
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/find_user_by_id?user_id="+this.post_id, options).subscribe({
      next: get_user_response => {          // On success
        console.log(get_user_response);
      }, 
      error: error => {         // On fail
        console.log(error);
      }});

      this.http.get<any>(this.backend_addr + "/search_community_by_post_id?post_id=" + this.post_id, options).subscribe({
        next: get_community_response => {          // On success
          console.log(get_community_response);
          this.post_community = get_community_response.name;
        }, 
        error: error => {         // On fail
          console.log(error);
        }});
  }

  like_button_click() {

  }



  show_posts() {
    if (!this.community_id){return;}

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
