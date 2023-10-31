import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

import { User } from "../../models/User";
import { Alias } from "../../models/Alias";
import { Post } from "../../models/Post";
import { Community } from "../../models/Community";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  private backend_addr : string = "http://localhost:8080/api";

  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  
  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  viewing_own_profile: boolean = false;

  // Viewed Profile info/stats
  id: string = "-1";
  username?: string = "N/A";
  bio: string = "N/A";
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  followed_communities: Array<string> = [];
  posts: Array<Post> = [];

  currently_editting: boolean = false;

  constructor(private router: Router, private clipboard: Clipboard, private http: HttpClient) {
    this.async_constructor();
  }

  async async_constructor() {
    // Get data from cookie
    this.getData();
    
    // Resolving pre-definition error, ask Alex about it if curious
    await new Promise(f => setTimeout(f, 1000));

    if (this.urlParams.get('id')) {
      this.id = this.urlParams.get('id') as string;

      if (this.id === this.self_id) {
        this.viewing_own_profile = true;
      }

      const options = { withCredentials : true};
      
      // Get username
      this.http.get<any>(this.backend_addr + "/user?id="+this.id, options).subscribe({
        next: get_user_response => {          // On success
          this.username = get_user_response.username;
        }, 
        error: error => {         // On fail
          console.log(error);
        }});
  
        // Get posts
        this.http.get<any>(this.backend_addr + "/user/posts?user_id="+this.id, options).subscribe({
          next: get_user_posts_response => {          // On success
            this.num_posts = get_user_posts_response.length;
            let i:number = 0;
            for (i = 0; i < get_user_posts_response.length; i++) {
              let newPost: Post = new Post(new Alias(new User(this.username as string), new Community()));
              newPost.content = get_user_posts_response[i].content;
              this.posts.push(newPost);
            }
          }, 
          error: error => {         // On fail
            console.log(error);
          }});
    } else {
      this.router.navigate(['/']);
    }

    this.num_posts = this.posts.length;
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response._id;
        this.followed_communities = info_response.followed_communities
        console.log(info_response);
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
      }});
  }

  change_edit() {
    this.currently_editting = !this.currently_editting;
  }

  change_info(new_username: string, new_bio: string) {
    this.currently_editting = false;

    // Visual fix
    if (new_username != "") {
      this.username = new_username;
    }
    this.bio = new_bio;

    // Call to backend to update data
    const options = { withCredentials : true };
    const username_body = { "new_username" : new_username };
    this.http.post<any>(this.backend_addr + "/change_username", username_body, options).subscribe({
      next: change_username_response => {}, error: error => {}});

    const desc_body = { "new_description" : new_bio }; 
    this.http.post<any>(this.backend_addr + "/change_description", desc_body, options).subscribe({
      next: change_description_response => {}, error: error => {}});
      
  } 
  share_action() {
    let domain_name: string = "";
    this.clipboard.copy(domain_name + this.router.url);
  }
  settings_action() {
    // Idk what to put here?
  }

  deleteAction() {
    this.router.navigate(['/permadelete']);
  }

  create_community_action() {
    this.router.navigate(['/new_community']);
  }

  signOut() {
    const options = { withCredentials : true };
    this.http.delete<any>(this.backend_addr + "/logout", options).subscribe({
      next: logout_response => {          // On success
        console.log(logout_response);
        
        // Redirect to login page
        this.router.navigate(['/login']);
      },
      error: error_response => {
        if (error_response.error.text == "Logged out successfully") {   // Success
          // Redirect to login page
          this.router.navigate(['/login']);
        }
        console.log(error_response);
      }
    });
  } 
}
