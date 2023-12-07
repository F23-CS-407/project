import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { UserInterface } from '../../../interfaces/user';

import { User } from '../../../../models/User';
import { Alias } from '../../../../models/Alias';
import { Post } from '../../../../models/Post';
import { Community } from '../../../../models/Community';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  private backend_addr: string = '/api';

  private urlParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );

  // Logged in user info
  currentUser?: UserInterface;
  logged_in: boolean = false;
  self_id: string = 'not logged in';
  viewing_own_profile: boolean = false;

  // Viewed Profile info/stats
  id: string = '-1';
  username?: string = 'N/A';
  bio: string = 'N/A';
  num_posts: number = 0;
  num_followers: number = 0;
  num_following: number = 0;
  followed_communities: Array<string> = [];
  posts: Array<Post> = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private clipboard: Clipboard,
    private http: HttpClient
  ) {
    this.async_constructor();
  }


  // ngOnInit() {
  //   this.userService.fetchUserProfile();
    

  //   this.userService.user.subscribe((userData: UserInterface) => {
  //     if (userData && userData._id) {
  //       console.log(userData); //For testing
  //       this.currentUser = userData;
  //       this.username = userData.username;
  //       this.bio = userData.bio;
  //       this.followed_communities = userData.followed_communities;
  //       this.posts = userData.posts;
  //       this.num_posts = userData.posts.length; 
  //       this.num_following = userData.followed_communities.length;
  //       this.num_followers = userData.followed_communities.length; //TODO: implement followers count
  //       this.self_id, this.id = userData._id;
  //       this.logged_in = true;
  //       this.viewing_own_profile = true;

  //       this.fetchUserPosts(userData._id); //not doing anything right now
  //     } else {
  //       console.log('No user data available');
  //       this.router.navigate(['/intro']);
  //     }
  //   });
  // }

  async async_constructor() {
    // Get data from cookie
    this.getData();

    // Resolving pre-definition error, ask Alex about it if curious
    await new Promise((f) => setTimeout(f, 1000));

    if (this.urlParams.get('id')) {
      this.id = this.urlParams.get('id') as string;

      if (this.id === this.self_id) {
        this.viewing_own_profile = true;
      }

      const options = { withCredentials: true };

      // Get username and bio
      this.http
        .get<any>(this.backend_addr + '/user?id=' + this.id, options)
        .subscribe({
          next: (get_user_response) => {
            // On success
            this.username = get_user_response.username;
            this.followed_communities = get_user_response.followed_communities;
            if (get_user_response.bio) {
              this.bio = get_user_response.bio;
            }
          },
          error: (error) => {
            // On fail
            console.log(error);
          },
        });

      // Get posts
      this.http
        .get<any>(this.backend_addr + '/user/posts?user_id=' + this.id, options)
        .subscribe({
          next: (get_user_posts_response) => {
            // On success
            this.num_posts = get_user_posts_response.length;

            let i: number = 0;
            for (i = 0; i < get_user_posts_response.length; i++) {
              // Create new post
              let newPost: Post = new Post(
                new Alias(new User(this.username as string), new Community()),
              );

              // Set id and content
              newPost.id = get_user_posts_response[i]._id;
              newPost.content = get_user_posts_response[i].content;

              // Get community
              this.http
                .get<any>(
                  this.backend_addr +
                    '/search_community_by_post_id?post_id=' +
                    newPost.id,
                  options,
                )
                .subscribe({
                  next: (get_community_response) => {
                    if (newPost.created_by && newPost.created_by.for_community) {
                      newPost.created_by.for_community.name = get_community_response.name;
                      newPost.created_by.for_community.id = get_community_response._id;
                    }
                  },
                  error: (error) => {
                    console.log('profile get commuity error');
                    console.log(error);
                  },
                });

              this.posts.push(newPost);
            }
          },
          error: (error) => {
            // On fail
            console.log(error);
          },
        });
    } else {
      console.log('FAIL - no id in url');
      this.router.navigate(['/']);
    }

    this.num_posts = this.posts.length;
  }

  fetchUserPosts(userId: string) {
    // Implement logic to fetch posts for the user
    // Use userId to make HTTP requests to fetch posts
  }

  //fetchUserProfile in user.service.ts is called in ngOnInit() above
  getData() {
    const options = { withCredentials: true };
    this.http.get<any>(this.backend_addr + '/user_info', options).subscribe({
      next: (info_response) => {
        // On success
        this.logged_in = true;
        this.self_id = info_response._id;
        console.log(info_response);
      },
      error: (error) => {
        // On fail
        console.log('No session: ');
        console.log(error);
      },
    });
  }

  share_action() {
    let domain_name: string = '';
    this.clipboard.copy(domain_name + this.router.url);
  }
  settings_action() {
    this.router.navigate(['/hubit/settings'])
  }

  create_community_action() {
    this.router.navigate(['/hubit/community-dashboard']);
  }

  toFollowedCommunities() {
    this.router.navigate(['/hubit/followed_communities'], {
      queryParams: { id: this.id },
    });
  }
}
