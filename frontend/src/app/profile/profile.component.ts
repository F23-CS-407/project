import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';

import { User } from "../../models/User";
import { Alias } from "../../models/Alias";
import { Post } from "../../models/Post";
import { Community } from "../../models/Community";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  // This guts: /profile?id=1234
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  

  current_user?: User = new User("-1");
  viewing_own_profile: boolean = true;
  currently_editting: boolean = false;

  id: string = "-1";
  username?: string = "N/A";
  bio: string = "N/A";
  num_posts: number = 25;
  num_followers: number = 156;
  num_following: number = 158;
  num_communities: number = 6;
  posts: Array<Post> = [];
  searchCriteria: string = ''; // Search in sidebar

  constructor(private router: Router, private clipboard: Clipboard) {
    // This is test data          
    this.posts.push(new Post(new Alias(new User("-1"), new Community())));
    this.posts.push(new Post(new Alias(new User("-1"), new Community())));
    this.posts.push(new Post(new Alias(new User("-1"), new Community())));

    if (sessionStorage.getItem("username")) {
      this.current_user?.set_username(sessionStorage.getItem("username")?.toString());
    }

    if (this.urlParams.get('id')) {
      this.id = this.urlParams.get('id') as string;

      //if (this.id = this.current_user) {}

      // Query backend for data on current id

    } else {
      // This is a test
      this.username = "John Smith";
      this.bio = `John has been an avid surfer for half of his life. He has climbed
                          8 mountains including Mount Everest standing at a whopping 29,032
                          feet. He also enjoys olympic rowing and running, completing his
                          fastest marathon in 3 hours.
                          `;
    }
  }


  edit_action() {
    this.currently_editting = !this.currently_editting;
  }
  change_bio(new_username: string, new_bio: string) {
    this.currently_editting = false;

    // Visual fix
    if (new_username != "") {
      this.username = new_username;
    }
    this.bio = new_bio;

    // Call to backend

  } 
  share_action() {
    let domain_name: string = "";
    this.clipboard.copy(domain_name + this.router.url);
  }
  settings_action() {
    // Idk what to put here?
  }

  
  performSearch() { 
    if (this.searchCriteria.trim() != '') {
      console.log('Perform search with criteria: ', this.searchCriteria);
      // TODO: Make HTTP request to backend

    } else {
      console.log('Invalid search criteria:', this.searchCriteria);
    }
    
  } 

  signOut() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/signup']);

  }
}
