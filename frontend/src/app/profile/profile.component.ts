import { Component } from '@angular/core';

import { User } from "../../models/User";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  // This guts: /profile?id=1234
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  current_user?: User = new User(1);
  id: number = -1;
  username?: string = "N/A";
  description: string = "N/A";
  num_posts: number = 25;
  num_followers: number = 156;
  num_following: number = 158;
  num_communities: number = 6;

  constructor() {
    console.log(typeof this.urlParams.get('id'));

    if (this.urlParams.get('id')) {
      this.id = parseInt(this.urlParams.get('id') as string);

    } else  if (sessionStorage.getItem("username")) {
      // Figure out a way to put this in session cookies and query backend 
      this.current_user?.set_username(sessionStorage.getItem("username")?.toString());
    } else {
      // This is a test
      this.username = "John Smith";
      this.description = `John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.
                          John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.
                          `;
      //this.description = "abc";
    }
  }

  share_action() {

  }
}
