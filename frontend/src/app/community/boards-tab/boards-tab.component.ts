import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-boards-tab',
  templateUrl: './boards-tab.component.html',
  styleUrls: ['./boards-tab.component.css']
})
export class BoardsTabComponent {
  @Input({required: true}) comm_id! : string;
  private backend_url : string = "http://localhost:8080/api";
  boards : any;

  constructor(private http: HttpClient){ }

  ngOnInit(){
    this.getCommunityBoards().subscribe((data: any) => {
      this.boards = data;
    });
  }

  getCommunityBoards(){
    return this.http.get<any>(this.backend_url + `/community/boards?id=${this.comm_id}`);
  }

  handleNewBoardClick(){
    console.log("Redirect to new board page? Make one???");

    //Uncomment below to add a test board.
    /*
    const test_comm = {
      name: "Test name",
      community: `${this.comm_id}`
    }

    this.http.post<any>(this.backend_url + "/board", test_comm).subscribe((res) => {
      console.log(res);
    });
    */
  }

  handleBoardClick(board_name : string){
    console.log(`Redirect to board ${board_name}`);
  }
}
