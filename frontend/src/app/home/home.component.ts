import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  private backend_addr : string = "http://localhost:8080/api";

  self_id: string = "";
  self_username?: string = undefined;
  logged_in: boolean = false;

  constructor(private router: Router, private http: HttpClient) {
    this.getData();
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        console.log(info_response);
        // if already logged in, go to their profile
        this.router.navigate(['/profile'], { queryParams: {id: info_response["_id"]}});
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
        // if not logged in, take them to login
        this.router.navigate([`/login`]);
      }});

  }

}