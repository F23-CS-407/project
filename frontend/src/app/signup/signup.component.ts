import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {   FormGroup, FormControl, Validators, ValidationErrors, ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
// form validation tips from https://coryrylan.com/blog/build-accessible-forms-with-angular       
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  // https://jasonwatmore.com/post/2019/11/21/angular-http-post-request-examples
  private backend_addr : string = "http://localhost:8080/api";

  constructor(private router: Router, private http: HttpClient) {

  }
  // This is here in case dynamic input checking is used
  create_account_button_disabled = false;

  // Error message variables - fix this to be one text
  username_error_shown: boolean = false;
  password_error_shown: boolean = false;
  passwordc_error_shown: boolean = true;

  // Input Validation for password and confirm password input fields
  static pattern = /[!@#$%^&*()-_=+{};:'"/]/;
  static uppercaseLetterPattern = "^.*[A-Z].*$";
  static lowercaseLetterPattern = "^.*[a-z].*$";
  static numberPattern = "^.*[0-9].*$";

  /* This is just for us to bypass while testing */
  password_checking:boolean = true;
password = new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(SignupComponent.uppercaseLetterPattern), Validators.pattern(SignupComponent.lowercaseLetterPattern), Validators.pattern(SignupComponent.numberPattern)]);
getError() {
  if (this.password.hasError("required")) {
    return "You must enter a password.";

  }
return "invalid";
}
  /*
passwordError() {
  if (this.password_checking) {
    // Logic for checking password
    if (password === null || password == "") {
      this.password_error_shown = true;
      return     "A password is required";

    } else if (new FormControl(password, Validators.minLength(8)).errors !== null) {
      this.password_error_shown = true;
      return "Must be 8 or more characters";
    } else if (!SignupComponent.pattern.test(password)) {
      this.password_error_shown = true;
      return "Must contain special character";
      
    } else if (new FormControl(password, Validators.pattern(SignupComponent.uppercaseLetterPattern)).errors !== null) {
      this.password_error_shown = true;
      return "Must contain uppercase letter";
    
    } else if (new FormControl(password, Validators.pattern(SignupComponent.lowercaseLetterPattern)).errors !== null) {
      this.password_error_shown = true;
      return "Must contain lowercase letter";
    } else if (new FormControl(password, Validators.pattern(SignupComponent.numberPattern)).errors !== null) {
      this.password_error_shown = true;
      return"Must contain a number";
      
    } else if (!(password === passwordc)) {
      this.passwordc_error_shown = true;
      return "Passwords must match";
    }
    } // End  of password checking
  }
*/
  public create_account(username : string, password : string, passwordc : string) {
    // Set variables back to default
    this.username_error_shown = false;
    this.password_error_shown = false;
    this.passwordc_error_shown = false;

    
    // Password requirements match, delete this
    console.log("All fields are valid");

    // Create user
    const body = { "username" : username, "password" : password};
    const options = { withCredentials : true };
    this.http.post<any>(this.backend_addr + "/create_user", body, options).subscribe({
      next: create_response => {          // On success
        this.router.navigate(['/']);
        /*
        // Log the user in
        this.http.post<any>(this.backend_addr + "/login", body, options).subscribe(
          {next: login_response => {
            console.log("login successful");
            console.log(login_response);
            // Redirect to main page
            
          }, 
          error: error => {
            console.log("Created account, but couldn't log in. This should never happen.");
          }});
          */
      }, 
      error: error => {         // On fail
        console.log("Create Account Error: " + error.toString());
      }});

}
}