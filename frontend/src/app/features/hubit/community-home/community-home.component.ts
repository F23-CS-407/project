import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewCommunityDialogComponent } from '../../../components/new-community-dialog/new-community-dialog.component';

@Component({
  selector: 'app-community-home',
  templateUrl: './community-home.component.html',
  styleUrls: ['./community-home.component.css']
})
export class CommunityHomeComponent {

  constructor(private dialog: MatDialog) {}

  openNewCommunityDialog(): void {
    const dialogRef = this.dialog.open(NewCommunityDialogComponent, {
      width: 'auto', 
      height: 'auto'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      //TODO Reload the component or fetch the updated data here
      
    });
  }
  
}
