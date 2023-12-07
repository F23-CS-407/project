import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
//import { FormControl, Validators } from '@angular/forms';
//import {ErrorStateMatcher} from '@angular/material/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private backend_addr : string = "/api";

  constructor(private router: Router, private http: HttpClient) {

  }
  // This is here in case dynamic input checking is used
  login_button_disabled = false;

  // Error message variables - fix this to be one text
  username_error_shown: boolean = false;
  password_error_shown: boolean = false;

  username_error_text: string = "";
  password_error_text: string = "";

  public login_account(username : string, password : string) {
    // Set variables back to default
    this.username_error_shown = false;
    this.password_error_shown = false;

    // Log the user in
    const body = { "username" : username, "password" : password};
    const options = { withCredentials : true };
    this.http.post<any>(this.backend_addr + "/login", body, options).subscribe(
      {next: login_response => {
        console.log(login_response);
        // Redirect to main page
        this.router.navigate(['/']);
      }, 
      error: error => {
        console.log(error);
      }
    });
  }
  
}
