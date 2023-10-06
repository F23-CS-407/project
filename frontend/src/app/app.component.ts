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
  
  //   performSearch() { 
  //     if (this.searchCriteria.trim() != '') {
  //       console.log('Perform search with criteria: ', this.searchCriteria);
  //       // TODO: Make HTTP request to backend
  
  //     } else {
  //       console.log('Invalid search criteria:', this.searchCriteria);
  //     }
      
  //   } 
  
  //   toggleSidePanel() {
  //     this.sidePanelVisible = !this.sidePanelVisible;
  //   }


}
