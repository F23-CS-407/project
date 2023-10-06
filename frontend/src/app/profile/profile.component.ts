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
  num_posts: number = 25;
  num_followers: number = 156;
  num_following: number = 158;
  num_communities: number = 6;
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
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response._id;
        this.username = info_response.username;
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
