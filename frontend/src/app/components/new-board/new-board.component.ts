import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-board',
  templateUrl: './new-board.component.html',
  styleUrls: ['./new-board.component.css'],
})
export class NewBoardComponent {
  boardName: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewBoardComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  createBoard(): void {
    if (this.boardName && this.data.communityId) {
      this.http
        .post('/api/board', {
          name: this.boardName,
          community: this.data.communityId,
        })
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            console.log(response);
          },
          error: (error) => {
            console.error('Error creating board:', error);
          },
        });
    }
  }
}
