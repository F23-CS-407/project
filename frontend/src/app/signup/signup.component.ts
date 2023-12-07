import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {   FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
// form validation tips from https://coryrylan.com/blog/build-accessible-forms-with-angular       
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  // https://jasonwatmore.com/post/2019/11/21/angular-http-post-request-examples
  private backend_addr : string = "/api";

  constructor(private router: Router, private http: HttpClient) {

  }
  // This is here in case dynamic input checking is used
  create_account_button_disabled = false;

  // Error message variables - fix this to be one text
  username_error_shown: boolean = false;
  password_error_shown: boolean = false;
  passwordc_error_shown: boolean = true;

  username_error_text: string = "";
  password_error_text: string = "";
  passwordc_error_text: string = "";

  // Input Validation for password and confirm password input fields
  static pattern = /[!@#$%^&*()-_=+{};:'"/]/;
  static uppercaseLetterPattern = "^.*[A-Z].*$";
  static lowercaseLetterPattern = "^.*[a-z].*$";
  static numberPattern = "^.*[0-9].*$";

  /* This is just for us to bypass while testing */
  password_checking:boolean = true;

    public getError(username: string, password: string, passwordc: string) {
    // Set variables back to default
    this.username_error_shown = false;
    this.password_error_shown = false;
    this.passwordc_error_shown = false;

    if (this.password_checking) {
      // Logic for checking password
      if (password === null || password == "") {
        this.password_error_shown = true;
        this.password_error_text = "A password is required";
      
      } else if (new FormControl(password, Validators.minLength(8)).errors !== null) {
        this.password_error_shown = true;
        this.password_error_text = "Must be 8 or more characters";
      return;
    } else if (!SignupComponent.pattern.test(password)) {
        this.password_error_shown = true;
        this.password_error_text = "Must contain special character";
        return;
      } else if (new FormControl(password, Validators.pattern(SignupComponent.uppercaseLetterPattern)).errors !== null) {
        this.password_error_shown = true;
        this.password_error_text = "Must contain uppercase letter";
        return;
      } else if (new FormControl(password, Validators.pattern(SignupComponent.lowercaseLetterPattern)).errors !== null) {
        this.password_error_shown = true;
        this.password_error_text = "Must contain lowercase letter";
        return;
      } else if (new FormControl(password, Validators.pattern(SignupComponent.numberPattern)).errors !== null) {
        this.password_error_shown = true;
        this.password_error_text = "Must contain a number";
        return;
      } else if (!(password === passwordc)) {
        this.passwordc_error_shown = true;
        this.passwordc_error_text = "Passwords must match";
        return;
    }
      } // End  of password checking
  }

  public create_account(username : string, password : string, passwordc : string) {

    // check password validation
    this.getError(username, password, passwordc);

    if (this.username_error_shown || this.password_error_shown || this.passwordc_error_shown) {
      return
    }

    // Password requirements match, delete this
    console.log("All fields are valid");

    // Create user
    const body = { "username" : username, "password" : password};
    const options = { withCredentials : true };
    this.http.post<any>(this.backend_addr + "/create_user", body, options).subscribe({
      next: create_response => {          // On success
        this.router.navigate(['/']);
      }, 
      error: error => {         // On fail
        console.log("Create account error:");
        console.log(error);
      }});
  }
}