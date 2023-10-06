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

  // This gets: /profile?id=1234
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  
  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  viewing_own_profile: boolean = false;

  // Viewed Profile info/stats
  currently_deleting: boolean = false;    // I'm not sure who added this or what it does
  id: string = "-1";
  username?: string = "N/A";
  bio: string = "N/A";
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  num_communities: number = 0;
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

      // Query backend for data on id
      const options = { withCredentials : true};
      this.http.get<any>(this.backend_addr + "/find_user_by_id?user_id="+this.id, options).subscribe({
        next: get_user_response => {          // On success
          this.username = get_user_response.username;
          console.log(get_user_response);
        }, 
        error: error => {         // On fail
          console.log(error);
        }});
  
        this.http.get<any>(this.backend_addr + "/user/posts?user_id="+this.id, options).subscribe({
          next: get_user_posts_response => {          // On success
            //this.posts = get_user_posts_response;
            let i:number = 0;
            for (i = 0; i < get_user_posts_response.length; i++) {
              let newPost: Post = new Post(new Alias(new User(this.username as string), new Community()));
              newPost.content = get_user_posts_response[i].content;
              this.posts.push(newPost);
            }
            console.log(get_user_posts_response);
          }, 
          error: error => {         // On fail
            console.log(error);
          }});
    } else {
      // This is a test
      this.viewing_own_profile = true;

      this.username = "John Smith";
      this.bio = `John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.
                          `;

      // This is test data          
      this.posts.push(new Post(new Alias(new User(this.self_id), new Community())));
      this.posts.push(new Post(new Alias(new User(this.self_id), new Community())));
      this.posts.push(new Post(new Alias(new User(this.self_id), new Community())));
    }

    this.num_posts = this.posts.length;
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response._id;
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

  change_bio(new_username: string, new_bio: string) {
    this.currently_editting = false;

    // Visual fix
    if (new_username != "") {
      this.username = new_username;
    }
    this.bio = new_bio;

    // Call to backend

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
    
  }

  signOut() {
    const options = { withCredentials : true };
    this.http.delete<any>(this.backend_addr + "/logout", options).subscribe({
      next: delete_response => {          // On success
        console.log(delete_response);
        
        // Redirect to signup page
        this.router.navigate(['/signup']);
      },
      error: error_response => {
        if (error_response.error.text == "Logged out successfully") {   // Success
          // Redirect to signup page
          this.router.navigate(['/signup']);
        }
        console.log(error_response);
      }
    });
  } 
}
