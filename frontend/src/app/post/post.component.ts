import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// TODO: Link to community

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  private backend_addr : string = "http://localhost:8080/api";
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  self_username: string = "no username";

  // Post Info
  post_id: string = "post_id_not_set";
  post_username: string = "username_not_set";
  post_user_id: string = "";
  post_community_name: string = "community_not_set";
  post_community_id: string = "commmunity_id_not_set";
  post_content: string = "content_not_set";
  
  like_count: number = 0;
  unlike_count: number = 0;
  has_liked: boolean = false;
  has_unliked: boolean = false;

  constructor(private http: HttpClient) {
    this.post_id = this.urlParams.get('post') as string;
    this.getData();
    this.get_post_data();
    this.initializeLikeStatus(); // Initialize the like status
    this.initializeUnlikeStatus();
  }


  async getData() {
    const options = { withCredentials : true};
    await this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response._id;
        this.self_username = info_response.username;
        console.log(info_response);
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
      }});
  }

  get_post_data() {
    // Query backend for data on post id
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/post?id="+this.post_id, options).subscribe({
      next: get_post_response => {          // On success
        console.log(get_post_response);
        this.post_user_id = get_post_response.created_by;
        this.post_content = get_post_response.content;
        
        // Get username
        this.http.get<any>(this.backend_addr + "/user?id="+this.post_user_id, options).subscribe({
          next: get_user_response => {this.post_username = get_user_response.username}});

        // Get community
        this.http.get<any>(this.backend_addr + "/search_community_by_post_id?post_id=" + this.post_id, options).subscribe({
          next: get_community_response => {this.post_community_name = get_community_response.name;
                                           this.post_community_id = get_community_response._id;}});

        // Get likes
        this.http.get<any>(this.backend_addr + "/post/likes?post=" + this.post_id, options).subscribe({
          next: get_likes_response => {this.like_count = get_likes_response.length;}});

        // Get if user has liked
        this.http.get<any>(this.backend_addr + "/post/user_liked?post=" + this.post_id + "&user="+this.self_id, options).subscribe({
          next: get_has_liked_response => {this.has_liked = get_has_liked_response==1?true:false;console.log(this.has_liked);}, 
          error: error => {
            console.log(error);
          }});
      }, 
      error: error => {         // On fail
        console.log(error);
      }});

      
  }

  like_button_click() {
    if (!this.logged_in) {
      // Handle the case when the user is not logged in.
      return;
    }

    if (this.has_liked) {
      // User wants to unlike the post
      this.unlikePost();
    } else {
      // User wants to like the post
      this.likePost();
    }
    // Debugging statement
    console.log('has_liked:', this.has_liked);
  }

  unlike_button_click() {
    if (!this.logged_in) {
      // Handle the case when the user is not logged in.
      return;
    }

    if (this.has_unliked) {
      // User wants to remove their dislike
      //this.ununlikedPost();
    } else {
      // User wants to dislike the post
      this.unlikePost();
    }
    // Debugging statement
    console.log('has_unliked:', this.has_unliked);
  }
  
  likePost() {
    if (!this.logged_in) {
      // Handle the case when the user is not logged in.
      return;
    }
  
    const options = { withCredentials: true };
    this.http
      .post(this.backend_addr + "/like_post", { post: this.post_id }, options)
      .subscribe(
        (response: any) => {
          if (response) {
            console.log('Like response:', response);
            this.has_liked = true;
            this.like_count++;
            console.log('Like count:', this.like_count);
          }
        },
        (error: any) => {
          console.error("Error liking the post:", error);
        }
      );
  }
  

  unlikePost() {
    if (!this.logged_in) {
      return;
    }
  
    const options = { withCredentials: true };
    this.http
      .delete(this.backend_addr + `/like_post?post=${this.post_id}`, options)
      .subscribe(
        (response: any) => {
          console.log('Unlike success:', response);
          if (response) {
            this.has_liked = false;
            this.like_count--;
            console.log('Like count:', this.like_count);
          }
        },
        (error: any) => {
          console.error("Error unliking the post:", error);
        }
      );
      }

    // Initialize 'has_liked' based on user's interaction with the post
  initializeLikeStatus() {
    if (!this.logged_in) {
      // If the user is not logged in, set 'has_liked' to false.
      this.has_liked = false;
    } else {
      // If the user is logged in, send a request to check if the user has liked the post.
      const options = { withCredentials: true };
      this.http.get(this.backend_addr + `/post/user_liked?post=${this.post_id}&user=${this.self_id}`, options)
        .subscribe((response: any) => {
          if (response === 1) {
            this.has_liked = true;
          } else {
            this.has_liked = false;
          }
        });
    }
  }

  // Initialize 'has_unliked' based on user's interaction with the post
  initializeUnlikeStatus() {
    if (!this.logged_in) {
      // If the user is not logged in, set 'has_unliked' to false.
      this.has_unliked = false;
    } else {
      // If the user is logged in, send a request to check if the user has unliked the post.
      const options = { withCredentials: true };
      this.http.get(this.backend_addr + `/post/user_disliked?post=${this.post_id}&user=${this.self_id}`, options)
        .subscribe((response: any) => {
          if (response === 1) {
            this.has_unliked = true;
          } else {
            this.has_unliked = false;
          }
        });
    }
  }
}
