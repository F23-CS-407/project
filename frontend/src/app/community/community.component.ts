import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { User } from "../../models/User";
import { Alias } from "../../models/Alias";
import { Post } from "../../models/Post";
import { Community } from "../../models/Community";

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent {
  private backend_addr : string = "http://localhost:8080/api";
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  private community_id : string = "";
  community_name : string = "N/A";
  community_desc : string = "N/A";
  community_post_ids : string[] = [];
  community_posts : Post[] = [];
  constructor(private http: HttpClient, private router: Router) {
    // Get community query
    this.community_id = this.urlParams.get('community') as string;
    if (this.community_id == undefined || this.community_id == ""){
      // Invalid community id
      this.router.navigate(["/"]);
    }
  
    // Get community data
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/community?id="+this.community_id, options).subscribe({
      next: get_community_response => {          // On success
        this.community_name = get_community_response.name;
        this.community_desc = get_community_response.description;
        
        // TODO: When community modification is added, check if logged in user is a mod with "response.mods"
      }, 
      error: error => {         // On fail
        console.log(error);

        // Trying to view a community that doesn't exist
        this.router.navigate(["/"]);
      }});
      
    // Get Community Posts Data
    this.http.get<any>(this.backend_addr + "/community/posts?community="+this.community_id, options).subscribe({
      next: get_community_posts_response => {          // On success
        for (let i = 0; i < get_community_posts_response.length; i++) {
          // Get post as object
          let curr_post = get_community_posts_response[i];

          // Get username from user_id
          let post_username: string = this.get_username(curr_post.created_by);

          // Create post object
          let new_post: Post = new Post(post_username);
          new_post.content = curr_post.content;
          
          // Add post to list for display
          this.community_posts.push(new_post);
        }
      }, 
      error: error => {         // On fail
        console.log(error);
      }});
  }

  /** 
   Given user id, returns associated account username
   **/
  private get_username(user_id: string) {
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/user?id="+user_id, options).subscribe({
      next: get_user_response => {          // On success
        return get_user_response.username;
      }, 
      error: error => {         // On fail
        
      }});

    return "get_username() is broken";
  }
}
