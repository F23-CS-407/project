import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-direct-messages',
  templateUrl: './view-direct-messages.component.html',
  styleUrls: ['./view-direct-messages.component.css']
})
export class ViewDirectMessagesComponent {
  private backend_addr: string = '/api';

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "1";
  self_username: string = "";

  // Inbox data
  userIds: string[] = [];
  userNames: string[] = [];

  constructor(private http: HttpClient, private router: Router) {
    this.async_constructor();
  }

  async async_constructor() {
    this.getData();

    while(this.self_id == "1") {
      await new Promise((f) => setTimeout(f, 1000));
    }

    this.getRecipients();
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr+"/user_info", options).subscribe({
      next: info_response => {
        this.logged_in = true;
        this.self_id = info_response._id;
        this.self_username = info_response.username;
      }, 
      error: error => {
        this.router.navigate(["/"]);
      }});
  }

  getRecipients() {
    this.http.get<any>(this.backend_addr + "/messages/"+this.self_id).subscribe({
      next: messages_response => {
        // Iterate through active chats
        for (let i = 0; i < messages_response.users.length; i++) {
          let currId = messages_response.users[i];
          this.userIds.push(currId);

          // Get username
          this.http.get<any>(this.backend_addr + "/user?id="+currId).subscribe({
            next: user_response => {
              this.userNames.push(user_response.username);
            }, error: error => {
              console.log("Messages-user?id= endpoint threw an error");
            }
          });
        }
      }, error: error => {
        console.log("messages/"+this.self_id+" threw an error");
      }
    });
  }
}
