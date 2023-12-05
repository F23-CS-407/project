import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  currently_editting: boolean = false;
  searchCriteria: string = ''; // Search in sidebar
  searchResults: any[] = []; // Array to store search results
  sidePanelVisible: boolean = false; // Initialize as hidden

constructor(private router: Router, private http: HttpClient) { }
  
performSearch(event: any) {
  this.sidePanelVisible = false
  this.searchResults = []
  this.searchCriteria = event;
    if (this.searchCriteria.trim()) {
      console.log('Perform search with criteria: ', this.searchCriteria);

      const api = '/api';

      // Perform both user and community searches
      this.http
        .get<any>(api + `/search_users?username=${this.searchCriteria}`)
        .subscribe(
          (userResponse: any) => {
            userResponse.forEach((r: any) => {
              if (!this.searchResults.includes(r)) {
                this.searchResults.push(r)
              }
            });
            console.log('User search results:', userResponse);
          }
        );

      this.http
        .get<any>(api + `/search_communities?name=${this.searchCriteria}`)
        .subscribe(
          (communityResponse: any) => {
            // Merge the community results with user results
            communityResponse.forEach((r: any) => {
              if (!this.searchResults.includes(r)) {
                this.searchResults.push(r)
                }
              })
              console.log('Community search results:', communityResponse);
          }
        );
    } else {
      console.error('Invalid search criteria:', this.searchCriteria);
    }
  }

  toProfile() {
    this.sidePanelVisible = false;
    this.router.navigateByUrl(`/`)
  }

  toCreateCommunity() {
    this.sidePanelVisible = false;
    this.router.navigateByUrl('/new_community')
  }

  toggleSidePanel() {
    this.sidePanelVisible = !this.sidePanelVisible;
    this.searchResults = [];
  }
}
