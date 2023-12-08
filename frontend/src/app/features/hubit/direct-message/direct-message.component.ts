import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY } from '@angular/material/snack-bar';

@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.css']
})
export class DirectMessageComponent {
  private backend_addr: string = '/api';

  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "1";

  // Person on other end
  recipient_id: string = "2";
  recipient_name: string = "recipient_name";

  messages: Message[] = [];

  constructor(private http: HttpClient, private router: Router) {
    this.async_constructor();
  }
  
  async async_constructor() {
    // Get other user
    if (this.urlParams.get('recipient_id')) {
      this.recipient_id = this.urlParams.get('recipient_id') as string;
      console.log("Param="+this.urlParams.get('recipient_id') as string);
      console.log("Recip_id="+this.recipient_id);
    } else {
      this.router.navigate(["/"]);
    }

    // Get logged in user data
    this.getData();

    while(this.self_id == "1") {
      await new Promise((f) => setTimeout(f, 1000));
    }

    // Get username of recipient
    this.http.get<any>(this.backend_addr + "/user?id="+this.recipient_id).subscribe({
      next: user_response => {
        this.recipient_name = user_response.username;
      }, error: error => {
        console.log("User ("+ this.recipient_id + ") could not be found");
      }
    });

    console.log("id="+this.recipient_id);
    console.log("name="+this.recipient_name);

    // Get messages between user 'self_id' and 'recipient_id'
    console.log("Calling endpoint: ("+this.backend_addr + "/messages/" + this.self_id + "/" + this.recipient_id+")");
    this.http.get<any>(this.backend_addr + "/messages/" + this.self_id + "/" + this.recipient_id).subscribe({
      next: dm_message_response => {
        // Get messages
        let i = 0;
        for (i = 0; i < dm_message_response.messages.length; i++) {
          let current = dm_message_response.messages[i];
          // This fixes an issue
          let dateString = current.timestamp as string;
          dateString = dateString.substring(0, dateString.length-5);
          console.log("dateString=("+dateString+")");
          this.messages.push(new Message(current.content, new Date(dateString).getTime(), current.sender));
        }
      }, error: error => {
        console.log("Getting messages threw an error");
      }
    });

    /* Sort by date if necessary
    if (this.messages.length > 1) {
      this.messages.sort((a: Message, b: Message) => {
        return a.sent.getTime() - b.sent.getTime();
      });
    }*/
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr+"/user_info", options).subscribe({
      next: info_response => {
        this.logged_in = true;
        this.self_id = info_response._id;
        console.log("getData returned:");
        console.log(info_response)
      }, 
      error: error => {
        this.router.navigate(["/"]);
      }});
  }

  date_format(d: Date) {
    return formatDate(d, 'hh:mm a', 'en-US');
  }

  new_message(new_message: string) {
    const body = {
      "content" : new_message,
      "senderId" : this.self_id,
      "receiverId" : this.recipient_id
    };
    this.http.post<any>(this.backend_addr + "/messages/newMessage", body)
    .subscribe({
      next: new_message_response => {
        // Refresh the page
        this.router.navigate(['/hubit/message'], {queryParams:{recipient_id : this.recipient_id}});
      }, error: error => {
        console.log("Could not create new message...");
      }
    });
  }
}

class Message {
  content: string = "";
  sent: Date = new Date(2023, 11, 15, 1, 0, 1, 0);
  sender_id: string = "";

  // Delete this
  constructor(c: string, minute: number, id: string) {
    this.content = c;
    this.sent = new Date(2023, 11, 15, 1, minute, 0, 0);
    this.sender_id = id;
  }
}
