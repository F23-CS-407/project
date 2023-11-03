import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.css']
})
export class BoardsComponent implements OnInit {
  community_id: string = ''; // Initialized as an empty string
  boards: any[] = []; // Initialized as an empty array

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('community_id');
      if (id) {
        this.community_id = id;
        this.getBoards();
      } else {
        // todo: Handle the case where community_id is not in the route
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
}
