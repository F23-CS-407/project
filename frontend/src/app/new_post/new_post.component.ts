import { Component } from '@angular/core';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { FileUploadService } from '../file-upload.service';
import { first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-new-post',
  templateUrl: './new_post.component.html',
  styleUrls: ['./new_post.component.css']
})
export class NewPostComponent {
  private backend_addr : string = "/api";
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  
  chip_options: Chip[] = [new Chip("green", "General"), new Chip("yellow", "Question"), new Chip("red", "Clip") ];
  customCategory: string = ''; 
  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  self_username: string = "no username";

  // Post page data
  community_id: string = "";
  community_name: string = "";
  community_desc: string = "";

  // media checkboxes
  have_media: boolean = false
  media_type: string = "photo"
  video = "video"
  photo = "photo"

  // Media upload
  mediaFile: File | null = null;
  mediaFileName: string | null = null;
  captionFile: File | null = null
  captionFileName: string | null = null;
  altText: string = "";

  // progress
  loading: boolean = false

  constructor(private router : Router, private http : HttpClient, private fileUploadService : FileUploadService) {
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
      this.mediaFile = fileList[0];
      this.mediaFileName = this.mediaFile.name;
    }
  }

  handleCaptionInput(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.captionFile = fileList[0];
      this.captionFileName = this.captionFile.name;
    }
  }

  async processUpload() {
    const options = { withCredentials: true };

    if (this.have_media) {

      if (this.media_type == "photo" && this.mediaFile) {

        let fd = new FormData()
        fd.append("file", this.mediaFile)

        try {
          let response = await firstValueFrom(this.http.post<any>(this.backend_addr + "/upload", fd, options)).catch(() => null)
          console.log(response)
          return response.url
        } catch {
          return null
        }

      } else if (this.mediaFile) {

        let fd = new FormData()
        fd.append("file", this.mediaFile)

        if (this.captionFile) {
          fd.append("captions", this.captionFile)
        }

        try {
          let response = await firstValueFrom(this.http.post<any>(this.backend_addr + "/upload/clip", fd, options)).catch(() => null)
          console.log(response)
          return response.url
        } catch {
          return null
        }
      }
    }
  }

  async create_post(description : string, chips : string[]) {

    this.loading = true

    // upload content, if error return
    let mediaUrl = await this.processUpload()
    if (this.have_media && !mediaUrl) {
      this.loading = false
      return
    }


    // If no value selected, default to General
    if (chips[0] == undefined) {
      chips[0] = 'General';
    }

    const body: any = {
      post: {
        content : description,
        tags : chips
      }, 
      community: this.community_id, 
      user: this.self_id
    };

    // if media or alt text add it to body
    if (mediaUrl) {
      body.post.media = mediaUrl
    }
    if (this.altText) {
      body.post.alt = this.altText
    }

    const options = { withCredentials: true };
    this.http.post<any>(this.backend_addr + "/create_post", body, options).subscribe({
      next: create_post_response => {
        console.log(create_post_response);
        this.loading = false
        this.router.navigate(['post'], { queryParams: { 'post': create_post_response._id } });
      },
      error: error => {
        console.log(error);
        this.loading = false
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
