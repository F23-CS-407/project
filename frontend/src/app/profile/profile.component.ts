import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

import { User } from "../../models/User";
import { Alias } from "../../models/Alias";
import { Post } from "../../models/Post";
import { Community } from "../../models/Community";

import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  private backend_addr : string = "/api";

  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  
  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  viewing_own_profile: boolean = false;

  // Viewed Profile info/stats
  id: string = "-1";
  profile_pic_url: string = "";
  username?: string = "N/A";
  bio: string = "N/A";
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  followed_communities: Array<string> = [];
  posts: Array<Post> = [];

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
      
      // Get username and bio
      this.http.get<any>(this.backend_addr + "/user?id="+this.id, options).subscribe({
        next: get_user_response => {          // On success
          this.username = get_user_response.username;
          this.followed_communities = get_user_response.followed_communities
          if (get_user_response.bio) {
            this.bio = get_user_response.bio;
          }
          if (get_user_response.profile_pic) {
            this.profile_pic_url = get_user_response.profile_pic;
          }
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
            // Create new post
            let newPost: Post = new Post(new Alias(new User(this.username as string), new Community()));
            
            // Set id and content
            newPost.id = get_user_posts_response[i]._id;
            newPost.content = get_user_posts_response[i].content;

            // Get community
            this.http.get<any>(this.backend_addr + "/search_community_by_post_id?post_id=" + newPost.id, options).subscribe({
              next: get_community_response => {newPost.created_by.for_community.name = get_community_response.name;
                                              newPost.created_by.for_community.id = get_community_response._id;},
                                            error: error => {console.log("profile get commuity error");console.log(error);}});
            
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
        console.log(info_response);
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
      }});
  }

  share_action() {
    let domain_name: string = "";
    this.clipboard.copy(domain_name + this.router.url);
  }
  settings_action() {
    this.router.navigate(['/account_data'])
  }

  create_community_action() {
    this.router.navigate(['/new_community']);
  }

  toFollowedCommunities() {
    this.router.navigate(["/followed_communities"], { queryParams: {id: this.id}});
  }
}
