import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-wrapper',
  templateUrl: './board-wrapper.component.html',
  styleUrls: ['./board-wrapper.component.css']
})
export class BoardWrapperComponent {
  private backend_addr : string = "http://localhost:8080/api";
  private urlParams: URLSearchParams = new URLSearchParams(window.location.search);

  community_id : string = "";
  board_id : string = "";
  board_type : number = 1;

  constructor(private http: HttpClient, private router: Router){ }

  ngOnInit(){
    this.community_id = this.urlParams.get('community') as string;
    this.board_id = this.urlParams.get('board') as string;

    if(this.community_id == undefined || this.community_id == "" || this.board_id == undefined || this.board_id == ""){
      this.router.navigate(["/"]);
    }
  }

  //Get board data (mostly type)
}
