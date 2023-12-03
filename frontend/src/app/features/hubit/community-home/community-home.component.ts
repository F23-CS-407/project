import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewCommunityDialogComponent } from '../../../components/new-community-dialog/new-community-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-home',
  templateUrl: './community-home.component.html',
  styleUrls: ['./community-home.component.css'],
})
export class CommunityHomeComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router,
  ) {}

  openNewCommunityDialog(): void {
    const dialogRef = this.dialog.open(NewCommunityDialogComponent, {
      width: 'auto',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.router.navigate(['/hubit/community']);
    });
  }
}
