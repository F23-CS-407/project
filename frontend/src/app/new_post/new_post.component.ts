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
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  
  chip_options: Chip[] = [new Chip("green", "General"), new Chip("yellow", "Question"), new Chip("red", "Clip") ];

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  self_username: string = "no username";

  // Post page data
  community_id: string = "";
  community_name: string = "";
  community_desc: string = "";

  // Video upload
  videoFile: File | null = null;
  videoFileName: string | null = null;

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
    // Get community id from query parameters
    this.community_id = this.urlParams.get('community') as string;
    if (this.community_id == undefined || this.community_id == "") {
      this.router.navigate(["/"]);
    }

    // Get community data
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/community?id="+this.community_id, options).subscribe({
      next: get_community_response => {          // On success
        this.community_name = get_community_response.name;
        this.community_desc = get_community_response.description;
      }, 
      error: error => {         // On fail
        console.log(error);

        // Trying to post to a community that doesn't exist
        this.router.navigate(["/"]);
      }});
  }

  handleFileInput(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.videoFile = fileList[0];
      this.videoFileName = this.videoFile.name;
    }
  }


  create_post(description : string, chips : string[]) {
    // If no value selected, default to General
    if (chips[0] == undefined) {
      chips[0] = 'General';
    }

    const formData = new FormData();
    formData.append('post', JSON.stringify({
      content: description,
      tags: chips
    }));
    formData.append('community', this.community_id);
    formData.append('user', this.self_id);

    if (this.videoFile) {
      formData.append('video', this.videoFile);
    }

    const options = { withCredentials: true };
    this.http.post<any>(this.backend_addr + "/create_post", formData, options).subscribe({
      next: create_post_response => {
        console.log(create_post_response);
        this.router.navigate(['post'], { queryParams: { 'post': create_post_response._id } });
      },
      error: error => {
        console.log(error);
      }
    });
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
