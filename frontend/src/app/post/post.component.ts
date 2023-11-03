import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { User } from '../../models/User';
import { Comment } from '../../models/Comment';

import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
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
  has_liked: boolean = false;

  comments: Comment[] = [];

  constructor(public http: HttpClient, private router: Router) {
    this.post_id = this.urlParams.get('post') as string;
    this.getData();
    this.get_post_data();
    this.get_comment_data();
  }


  async getData() {
    const options = { withCredentials : true};
    await this.http.get<any>("api/user_info", options).subscribe({
      next: info_response => {
        this.logged_in = true;
        this.self_id = info_response._id;
        this.self_username = info_response.username;
        console.log(info_response);
        this.get_post_data();
      }, 
      error: error => {
        console.log("No session: ");
        console.log(error);
      }});
  }

  get_post_data() {
    // Query backend for data on post id
    const options = { withCredentials : true };
    this.http.get<any>("api/post?id="+this.post_id, options).subscribe({
      next: get_post_response => {
        console.log(get_post_response);
        this.post_user_id = get_post_response.created_by;
        this.post_content = get_post_response.content;
        this.like_count = get_post_response.liked_by.length;
        
        // Get username
        this.http.get<any>("api/user?id="+this.post_user_id, options).subscribe({
          next: get_user_response => {this.post_username = get_user_response.username}});

        // Get community
        this.http.get<any>("api/search_community_by_post_id?post_id=" + this.post_id, options).subscribe({
          next: get_community_response => {this.post_community_name = get_community_response.name;
                                           this.post_community_id = get_community_response._id;}});

        // Get likes
        this.http.get<any>("api/post/likes?post=" + this.post_id, options).subscribe({
          next: get_likes_response => {this.like_count = get_likes_response.length;}});

        // Get if user has liked
        this.http.get<any>("/post/user_liked?post=" + this.post_id + "&user="+this.self_id, options).subscribe({
          next: get_has_liked_response => {
            this.has_liked = get_has_liked_response==1?true:false;
          },
          error: error => {
            console.log(error);
          }});
      }, 
      error: error => {
        console.log(error);
      }});
  }

  get_comment_data() {
    // Query backend for data on post id
    const options = { withCredentials : true };
    this.http.get<any>("api/post/comments?post="+this.post_id, options).subscribe({
      next: get_comments_response => {
        let length = get_comments_response.length;
        for (let i = 0; i < length; i++) {
          let comment = get_comments_response[i];

          // Create new comment object
          let new_comment: Comment = new Comment(new User(comment.created_by));
          new_comment.id = comment._id;
          new_comment.text = comment.content;

          // Get username
          this.http.get<any>("api/user?id="+comment.created_by, options).subscribe({
            next: get_user_response => {new_comment.creator.username = get_user_response.username}});

          // Add comment to list
          this.comments.push(new_comment);
        }
      }, 
      error: error => {
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

  create_comment(content: string) {
    const options = { withCredentials : true };
    const body = { "comment" : {"content" : content}, "post" : this.post_id};
    this.http.post<any>("api/create_comment", body, options).subscribe({
      next: create_comment_response => {
        // Reload the page
        window.location.reload();
      },
      error: error => {
        console.log(error);
      }});
  }

  delete_comment(id: string) {
    const body = {"comment" : id};
    const options = { withCredentials : true, body: body };
    this.http.delete<any>("api/comment", options).subscribe({
      next: delete_comment_response => {
        // Reload the page
        window.location.reload();
      },
      error: error => {
        if (error.status == 200){
          // Reload the page
          window.location.reload();
        }
        console.log(error);
      }});
  }
  
  likePost() {
    if (!this.logged_in) {
      // Handle the case when the user is not logged in.
      return;
    }
  
    const options = { withCredentials: true };
    this.http.post<any>("api/like_post", { post: this.post_id }, options).subscribe({
      next: response => {
        if (response) {
          console.log('Like response:', response);
          this.has_liked = true;
          this.like_count = response.liked_by.length;
          console.log('Like count:', this.like_count);
        }
      },
      error: error=> {
        console.error("Error liking the post:", error);
      }});
  }
  

  unlikePost() {
    if (!this.logged_in) {
      return;
    }
  
    const options = { withCredentials: true };
    this.http
      .delete(`api/like_post`, {...options, body: {post: this.post_id}})
      .subscribe(
        (response: any) => {
          console.log('Unlike success:', response);
          if (response) {
            this.has_liked = false;
            this.like_count = response.liked_by.length;
            console.log('Like count:', this.like_count);
          }
        },
        (error: any) => {
          console.error("Error unliking the post:", error);
        });
  }
}
