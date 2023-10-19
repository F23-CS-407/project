import { Component } from '@angular/core';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: 'app-post',
  templateUrl: './new_post.component.html',
  styleUrls: ['./new_post.component.css']
})
export class NewPostComponent {
  private backend_addr : string = "http://localhost:8080/api";
  
  chip_options: Chip[] = [new Chip("green", "General"), new Chip("yellow", "Question"), new Chip("red", "Clip") ];

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  self_username: string = "no username";

  // Post page data
  community_id: string = "";
  community_name: string = "";
  community_desc: string = "";

  constructor(private router : Router, private http : HttpClient) {
    this.async_constructor();
  }
  async async_constructor() {
    await this.getData();

    // Resolving pre-definition error, ask Alex about it if curious
    await new Promise(f => setTimeout(f, 1000));

    this.get_community();

    await new Promise(f => setTimeout(f, 1000));

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

  get_community() {
    // TODO: Add HttpClient.get(/community?id=query_param)

  }

  create_post(description : string, chips : string[]) {
    const body = {post: {content : description,
                         post_user : this.self_id,
                         created_date : Date(),
                         tags : chips}, 
                  community: this.community_id, 
                  user: this.self_id};
    const options = { withCredentials : true};
    this.http.post<any>(this.backend_addr + "/create_post", body, options).subscribe({
      next: create_post_response => {          // On success
        console.log(create_post_response);
      }, 
      error: error => {         // On fail
        console.log(error);
      }});
  }

}

class Chip {
  color: string = "red";
  text: string = "";
  constructor(color: string, text: string) {
    this.color = color;
    this.text = text;
  }
}
