import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showToolbarButtons = false;
  title = 'frontend';
  currently_editting: boolean = false;
  searchCriteria: string = ''; // Search in sidebar
  sidePanelVisible : boolean = false;
    performSearch() { 
      if (this.searchCriteria.trim() != '') {
        console.log('Perform search with criteria: ', this.searchCriteria);
        // TODO: Make HTTP request to backend
  
      } else {
        console.log('Invalid search criteria:', this.searchCriteria);
      }
      
    } 

   
  toggleToolbarButtons() {
    // Toggle the value of showToolbarButtons when the toolbar is clicked
    this.showToolbarButtons = !this.showToolbarButtons;
  }


}
