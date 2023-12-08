import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.css']
})
export class DirectMessageComponent {

  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "1";

  // Person on other end
  recipient_id: string = "2";
  recipient_name: string = "recipient_name";

  messages: Message[] = [];

  constructor(private http: HttpClient, private router: Router) {
    // TODO: Get logged in user data
    //this.getData();

    // This is for testing - creates messages
    let longer_message: string = " This is a message to you that should fill the box and wrap around the div, asdklfjhsa lkdfash dfklashdklf sfs d nfasndf asndfn asndf ans dfnas dnf asdnf asndf asnd fnas dfnas dfnasfdn";
    for (let i = 1; i < 6; i++) {
      let m: Message = new Message("m"+i+longer_message, i, ((i+1)%2+1).toString());
      this.messages.push(m);
    }


    // Soft by date if necessary
    if (this.messages.length > 1) {
      this.messages.sort((a: Message, b: Message) => {
        return a.sent.getTime() - b.sent.getTime();
      });
    }
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>("/user_info", options).subscribe({
      next: info_response => {
        this.logged_in = true;
        this.self_id = info_response._id;
        console.log(info_response);
      }, 
      error: error => {
        // TODO: Uncomment this later
        //this.router.navigate(["/"]);
      }});
  }

  date_format(d: Date) {
    return formatDate(d, 'hh:mm a', 'en-US');
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
