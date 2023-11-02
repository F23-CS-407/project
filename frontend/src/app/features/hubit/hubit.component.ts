import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hubit',
  templateUrl: './hubit.component.html',
  styleUrls: ['./hubit.component.css']
})
export class HubitComponent implements OnInit {

  private backend_addr: string = "http://localhost:8080/api";

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.checkAuthentication();
  }

  // private async async_constructor() {
  //   let current_user : User = await User.get_current_user_data();

  //   this.self_id = current_user.get_id();
  //   if (this.self_id !== "-1" && this.self_id !== "-2") {
  //     this.logged_in = true;
  //   }
  //   this.self_username = current_user.get_username();
  // }

  // getData() {
  //   const options = { withCredentials : true};
  //   this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
  //     next: login_response => {          // On success
  //       this.logged_in = true;
  //       console.log(login_response.username);
  //     }, 
  //     error: error => {         // On fail
  //       console.log("No session: ");
  //       console.log(error);
  //     }});

  // }

  checkAuthentication(): void {
    this.http.get(this.backend_addr + '/auth_test', { withCredentials: true }).subscribe(
      response => {
        console.log('User is authenticated:', response);
      },
      error => {
        console.error('User is not authenticated:', error);
       // this.router.navigate(['/intro']);  // Redirect to 'intro' route
      }
    );
  }
}
