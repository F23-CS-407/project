import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/*This component mainly exists to wrap around the map functionality.
Its jobs are to pass data down to each of its individual components.
For this sprint (sprint 2), we only really need the image of the map, but 
I designed it in this way to make it easier to add new sections for the final
sprint.*/

const options = { withCredentials : true };

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  styleUrls: ['./map-wrapper.component.css']
})
export class MapWrapperComponent {
  @Input({required: true}) board_id! : string;
  private backend_url : string = "http://localhost:8080/api";
  selectedFile!: File | undefined;
  image! : HTMLImageElement;
  previewimage : boolean = false;

  constructor(private http: HttpClient) { }

  //Example of how we'll be handling gathering data.
  //Mainly need the image for this sprint.
  ngOnInit(){
    console.log("Map wrapper successfully loaded");
    this.getBoardInfo().subscribe((data: any) => {
      this.image = data.image;
    });
  }

  //Gets information about the current board.
  getBoardInfo(){
    return this.http.get<any>(this.backend_url + `/board?id=${this.board_id}`);
  }

  postFile(formData : FormData){
    return this.http.post(this.backend_url + `/upload`, formData, options);
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0] as File;
    if(this.selectedFile){

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.image = new Image();
        this.image.src = e.target.result;
        this.previewimage = true;
      }

      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(){
    console.log("Upload " + this.image);
    
    /*
    if(this.selectedFile){
      const localData = new FormData();
      localData.append("file", this.selectedFile);

      this.postFile(localData).subscribe({
        next: response => {
          console.log("Success?");
          this.previewimage = false;
          this.selectedFile = undefined;
        },
        error: error => {
          console.log("Error?");
          console.log(error);
          this.previewimage = false;
          this.selectedFile = undefined;
        }
      });
    }
    */
  }
}