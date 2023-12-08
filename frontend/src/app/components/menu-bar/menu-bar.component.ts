import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UserInterface } from 'src/app/interfaces/user';

import { User } from 'src/models/User';
import { Post } from 'src/models/Post';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent {

  // Logged in user info
  currentUser?: UserInterface;
  logged_in: boolean = false;
  self_id: string = 'not logged in';
  viewing_own_profile: boolean = false;
 
  id: string = '-1';
  username?: string = 'N/A';
  bio: string = 'N/A';
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  followed_communities: Array<string> = [];
  posts: Array<Post> = [];

  constructor(private router: Router, private userService: UserService) {}
  // Viewed Profile info/stats



  ngOnInit() {
    this.userService.fetchUserProfile();

    this.userService.loading.subscribe(loading => {
      if (!loading) {
        this.userService.user.subscribe((userData: UserInterface) => {
          if (userData && userData._id) {
            this.currentUser = userData;
            this.username = userData.username;
            this.bio = userData.bio;
            this.followed_communities = userData.followed_communities;
            this.posts = userData.posts;
            this.num_posts = userData.posts.length; 
            this.num_following = userData.followed_communities.length;
            this.num_followers = userData.followed_communities.length; //TODO: implement followers count
            this.self_id, this.id = userData._id;
            this.logged_in = true;
            this.viewing_own_profile = true;

          } else {
            console.log('No user data available');
            this.router.navigate(['/intro']);
          }
        });
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToProfile(): void {
    this.router.navigate(['/hubit/profile'], { queryParams: { id: this.id } });
  }

}
