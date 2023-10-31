import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Hubit';

  // currently_editting: boolean = false;
  // searchCriteria: string = ''; // Search in sidebar
  // sidePanelVisible: boolean = false; // Initialize as hidden
  
  // performSearch() { 
  //   if (this.searchCriteria.trim() != '') {
  //     console.log('Perform search with criteria: ', this.searchCriteria);

  //     const api = 'http://localhost:8080/api';

  //       this.http.get<any>(api + `/search_users?username=${this.searchCriteria}`).subscribe(
  //       (response: any) => {
  //         // Handle the response from the backend
  //         this.searchResults = response;
  //         console.log(response);
  //       },
  //       // TODO: Make HTTP request to backend
  //     );
          
    
  //   //     } else {
  //   //       console.log('Invalid search criteria:', this.searchCriteria);
  //   //     }
        
  //   //   } 
    
  //   //   toggleSidePanel() {
  //   //     this.sidePanelVisible = !this.sidePanelVisible;
  //   //   }


  // }
}
