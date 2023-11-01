import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/*This component mainly exists to wrap around the map functionality.
Its jobs are to pass data down to each of its individual components.
For this sprint (sprint 2), we only really need the image of the map, but 
I designed it in this way to make it easier to add new sections for the final
sprint.*/

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  styleUrls: ['./map-wrapper.component.css']
})
export class MapWrapperComponent {
  @Input({required: true}) board_id! : number;
  private backend_url : string = "http://localhost:8080/api";
  image! : HTMLImageElement; //TODO: Need to change depending on data type we actually receive from backend.

  constructor(private http: HttpClient) { }

  //Example of how we'll be handling gathering data.
  //Mainly need the image for this sprint.
  ngOnInit(){
    this.getBoardInfo().subscribe((data: any) => {
      this.image = data.image;
    });
  }

  //Gets information about the current board.
  getBoardInfo(){
    return this.http.get<any>(this.backend_url + `/board?id=${this.board_id}`);
  }
}