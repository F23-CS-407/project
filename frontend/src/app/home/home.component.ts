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
  private backend_addr : string = "http://localhost:3000";

  id: string = "";
  username?: string = undefined;
  logged_in: boolean = false;

  constructor(private router: Router, private http: HttpClient) {
    this.getData();
  }

  getData() {
    const options = { withCredentials : true};
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: login_response => {          // On success
        this.logged_in = true;
        console.log(login_response.username);
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);
      }});

  }

}