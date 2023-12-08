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
  profileImageUrl: string | null = null;

  private urlParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );

  // Loading page
  pageLoaded: boolean = false;

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
  categories: Set<String> = new Set()

  show_posts: Array<Post> = []

  selected_category: String = ""

  // For inbox icon
  dm_count: number = 0;

  constructor(
    private userService: UserService,
    private router: Router,
    private clipboard: Clipboard,
    private http: HttpClient
  ) {
    this.async_constructor();
  }

  changeSelect(value: string) {
    this.selected_category = value
    if (this.selected_category) {
      this.show_posts = this.posts.filter(p => {
        console.log(p.category, this.selected_category)
        return p.category == this.selected_category
    })
    } else {
      this.show_posts = this.posts
    }
  }
  
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
            this.profileImageUrl = get_user_response.profile_pic;
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

              if (get_user_posts_response[i].category) {
                this.categories.add(get_user_posts_response[i].category)
              }
              newPost.category = get_user_posts_response[i].category

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
              this.show_posts.push(newPost)
              console.log("POST", newPost)
            }
          },
          error: (error) => {
            // On fail
            console.log(error);
          },
        });

      // Get message count
      if (this.viewing_own_profile) {
        this.http.get<any>(this.backend_addr + "/messages/"+this.self_id)
        .subscribe({
          next: messages_response => {
            this.dm_count = messages_response.users.length;
          }, error: error => {
            console.log("Endpoint messages/:userid threw an error");
          }
        });
      }
      
    } else {
      console.log('FAIL - no id in url');
      this.router.navigate(['/']);
    }

    this.num_posts = this.posts.length;

    this.pageLoaded = true;
  }

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
    this.router.navigate(['/hubit/profile/followed-communities'], {
      queryParams: { id: this.id },
    });
  }

  toSavedPosts() {
    this.router.navigate(['/hubit/saved']);
  }

  toLikedPosts() {
    this.router.navigate(['/hubit/liked']);
  }

  toAllDMs() {
    this.router.navigate(['/hubit/all_messages']);
  }
  toDM() {
    this.router.navigate(['/hubit/message'], {queryParams:{recipient_id : this.id}});
  }
}
