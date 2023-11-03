import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { NewBoardComponent } from '../new-board/new-board.component';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.css']
})
export class BoardsComponent implements OnInit {
  community_id: string = '';
  boards: any[] = [];
  logged_in = false;
  self_id = "";
  community: any = {}
  is_mod = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public dialog: MatDialog
  ) {}


  ngOnInit(): void {
    this.community_id = this.route.snapshot.paramMap.get('id') || '';
    if (this.community_id) {
      this.getBoards();
    } else {
      // Handle the case where community_id is not in the route
    }
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(NewBoardComponent, {
      width: '250px',
      data: { communityId: this.community_id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boards.push(result); 
      }
    });
  }

  getCommunity() {
    this.http.get<any[]>(`/api/community?id=${this.community_id}`).subscribe({
      next: (data) => {
        this.community = data;
        if (this.community.mods.includes(this.self_id)) {
          this.is_mod = true;
        }
      },
      error: (error) => {
        console.error('There was an error fetching the boards', error);
      }
    });
  }

  getBoards(): void {
    this.http.get<any[]>(`/api/community/boards?id=${this.community_id}`).subscribe({
      next: (data) => {
        this.boards = data;
      },
      error: (error) => {
        console.error('There was an error fetching the boards', error);
      }
    });
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>("/api/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response._id;
        console.log(info_response);
        this.getCommunity()
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
      }});
  }
}
