import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service'; // Ensure this path is correct
import { UserInterface } from '../../../interfaces/user'; // Ensure this path is correct

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  current_user?: UserInterface;
  username?: string = 'N/A';
  bio: string = 'N/A';
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  num_communities: number = 0;
  posts: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    this.userService.user.subscribe({
      next: (userData) => {
        console.log('User profile data received:', userData);
        this.current_user = userData;
        this.username = userData.username;
        this.posts = userData.posts || [];
        this.num_posts = userData.posts.length;
        this.num_following =
          userData.followed_communities.length + userData.mod_for.length;
        this.num_communities = userData.followed_communities.length;
        this.bio = userData.bio;

        //temporary (creating user does not create this entries)
        this.num_followers = 0;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      },
    });

    // Trigger the fetchUserProfile method in the service to get the data
    this.userService.fetchUserProfile();
  }
}
