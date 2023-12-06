import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { Community } from 'src/models/Community';

const options = { withCredentials: true };

type FollowedCommunityEntry = {
  community: any;
  logged_in_user_following: boolean;
  show_follow_button: boolean;
};

@Component({
  selector: 'app-profile',
  templateUrl: './followed-communities.component.html',
  styleUrls: ['./followed-communities.component.css'],
})
export class FollowedCommunitiesComponent {
  private backend_addr: string = 'http://localhost:8080/api';

  private urlParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );

  id: string = '';
  username: string = '';
  logged_in: boolean = false;
  self_id: string = '';
  entries: FollowedCommunityEntry[] = [];

  constructor(
    private router: Router,
    private clipboard: Clipboard,
    private http: HttpClient,
  ) {
    this.async_constructor();
  }

  async async_constructor() {
    // get user id
    if (this.urlParams.get('id')) {
      this.id = this.urlParams.get('id') as string;
    }

    // get logged in user and requested user data
    this.getData();
    await new Promise((f) => setTimeout(f, 1000));

    // get the followed communities
    this.getFollowedCommunities();
    await new Promise((f) => setTimeout(f, 1000));

    // get followed status if logged in
    if (this.logged_in) {
      this.entries.forEach((_, i) => this.setFollowStatus(i));
    }
  }

  getData() {
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

    this.http
      .get<any>(this.backend_addr + `/user?id=${this.id}`, options)
      .subscribe({
        next: (info_response) => {
          // On success
          this.username = info_response.username;
          console.log(info_response);
        },
        error: (error) => {
          // On fail
          console.log(error);
        },
      });
  }

  getFollowedCommunities() {
    this.http
      .get<any>(
        this.backend_addr + `/user/followed_communities?id=${this.id}`,
        options,
      )
      .subscribe({
        next: (info_response) => {
          // On success
          this.entries = info_response.map((e: any) => {
            return {
              community: e,
              logged_in_user_following: false,
              show_follow_button: false,
            } as FollowedCommunityEntry;
          });
          console.log(info_response);
        },
        error: (error) => {
          // On fail
          console.log('No session: ');
          console.log(error);
        },
      });
  }

  setFollowStatus(i: number) {
    this.http
      .get<any>(
        this.backend_addr +
          `/user/is_following_community?id=${this.entries[i].community._id}`,
        options,
      )
      .subscribe({
        next: (is_following_response) => {
          this.entries[i].logged_in_user_following = is_following_response;
          this.entries[i].show_follow_button = true;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  followCommunityCall = (i: number) => {
    this.entries[i].show_follow_button = false;
    this.http
      .post(
        this.backend_addr + '/user/follow_community',
        { id: this.entries[i].community._id },
        options,
      )
      .subscribe({
        next: (response) => {
          this.entries[i].logged_in_user_following = true;
          this.entries[i].show_follow_button = true;
        },
        error: (error) => {
          console.log(error);
          if (error.status == 409) {
            this.entries[i].logged_in_user_following = true;
          }
          this.entries[i].logged_in_user_following = false;
          this.entries[i].show_follow_button = true;
        },
      });
  };

  unfollowCommunityCall = (i: number) => {
    this.entries[i].show_follow_button = false;
    this.http
      .post(
        this.backend_addr + '/user/unfollow_community',
        { id: this.entries[i].community._id },
        options,
      )
      .subscribe({
        next: (response) => {
          this.entries[i].logged_in_user_following = false;
          this.entries[i].show_follow_button = true;
        },
        error: (error) => {
          console.log(error);
          if (error.status == 409) {
            this.entries[i].logged_in_user_following = false;
          }
          this.entries[i].logged_in_user_following = true;
          this.entries[i].show_follow_button = true;
        },
      });
  };

  toCommunity(i: number) {
    this.router.navigate(['/community'], {
      queryParams: { community: this.entries[i].community._id },
    });
  }
}
