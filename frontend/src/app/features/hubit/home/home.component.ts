import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UserInterface } from 'src/app/interfaces/user';
import { Post } from 'src/models/Post';
import { CommunityService } from 'src/app/services/community.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: any[] = [];
  communitySearchResults: any[] = [];
  search: string = '';
  notEmpty: boolean = false;

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private communityService: CommunityService,
  ) {
    this.searchForm = this.fb.group({
      search: ['', Validators.required],
    });
  }


  ngOnInit() {
    this.userService.fetchUserProfile();

    this.userService.loading.subscribe(loading => {
      if (!loading) {
        this.userService.user.subscribe((userData: UserInterface) => {
          if (userData && userData._id) {
            console.log(userData); //For testing
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

  goToUserProfile(userId: string) {
    this.router.navigate(['/hubit/profile'], { queryParams: { id: userId } });
  }

  goToCommunityProfile(communityId: string) {
    console.log('Going to community profile with id: ', communityId);
    this.router.navigate(['/hubit/community'], { queryParams: { community: communityId } });
  }


  onChange() {
    const searchVal = this.searchForm.get('search')?.value;
    this.notEmpty = searchVal.length > 0;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchForm.valid) {
      const searchInput = this.searchForm.get('search')?.value;
      this.performSearch(searchInput);
    } else {
      // Handle form validation errors or show a message to the user
      console.error('Form is invalid');
    }
  }

  performSearch(searchCriteria: string) {
    if (searchCriteria && searchCriteria.trim() !== '') {
      console.log('Perform search with criteria: ', searchCriteria);
      const api = '/api';
      // Search for users
      this.http
        .get<any>(`${api}/search_users?username=${searchCriteria}`)
        .subscribe(
          (response: any) => {
            this.searchResults = response;
            console.log('User search response:', response);
          },
          (error) => {
            console.error('User search failed:', error);
          },
        );
      // Search for communities
      this.http
        .get<any>(`${api}/search_communities?name=${searchCriteria}`)
        .subscribe(
          (response: any) => {
            this.communitySearchResults = response;
            console.log('Community search response:', response);
          },
          (error) => {
            console.error('Community search failed:', error);
          },
        );
    } else {
      console.error('Invalid search criteria:', searchCriteria);
    }
  }
}
