import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  searchForm: FormGroup;
  searchResults: any[] = [];
  communitySearchResults: any[] = [];
  search: string = '';
  notEmpty: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      search: ['', Validators.required],
    });
  }

  goToUserProfile() {
    // TODO navigate to specific profile
    this.router.navigate(['/hubit/profile']);
  }

  goToCommunityProfile() {
    // TODO navigate to specific community profile
    this.router.navigate(['/hubit/community']);
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
      const api = 'http://localhost:8080/api';
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
