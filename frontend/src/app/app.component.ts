import { HttpBackend } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

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

constructor(private http: HttpClient) { }
  
performSearch() { 
  if (this.searchCriteria.trim() != '') {
    console.log('Perform search with criteria: ', this.searchCriteria);

     const api = 'http://localhost:8080/api';

      this.http.get(api, { params: { query: this.searchCriteria } }).subscribe(
      (response: any) => {
        // Handle the response from the backend
        this.searchResults = response;
      },
      // TODO: Make HTTP request to backend
    )
        
  
      } else {
        console.error('Invalid search criteria:', this.searchCriteria);
      }
      
    } 
  
    toggleSidePanel() {
      this.sidePanelVisible = !this.sidePanelVisible;
    }


}
