import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from "../../../models/User";

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css'],
})
export class IntroComponent {
  private backend_addr: string = "http://localhost:8080/api";

  username!: string;
  password!: string;
  email!: string;
  showLoginForm = true;
  errorMessage: string = '';  // To hold error messages
  self_id: string = "";
  self_username?: string = undefined;
  logged_in: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    this.getData();
  }

  private async async_constructor() {
    let current_user : User = await User.get_current_user_data();

    this.self_id = current_user.get_id();
    if (this.self_id !== "-1" && this.self_id !== "-2") {
      this.logged_in = true;
    }
    this.self_username = current_user.get_username();
  }

  showRegistrationForm() {
    this.showLoginForm = false;
  }

  showLoginFormAgain() {
    this.showLoginForm = true;
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

  loginUser(event: Event) {
    event.preventDefault();
    const user = { username: this.username, password: this.password };
    const options = { withCredentials: true };

    this.http.post(this.backend_addr + '/login', user, options).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        this.router.navigate(['/hubit']);  // Redirect to 'hubit' route
      },
      (error: any) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Login failed. Please check your credentials and try again.';  // Set error message
      }
    );
  }

  registerUser(event: Event) {
    event.preventDefault();
    const body = { "username" : this.username, "password" : this.password};
    const options = { withCredentials : true };

    this.http.post<any>(this.backend_addr + "/create_user", body, options).subscribe({
      next: create_response => {
        console.log(create_response);

        // Log the user in
        this.http.post<any>(this.backend_addr + "/login", body, options).subscribe(
          {next: login_response => {
            console.log("login successful");
            console.log(login_response);
            this.router.navigate(['/hubit']);  // Redirect to 'hubit' route
          }, 
          error: error => {
            console.log("Created account, but couldn't log in. This should never happen.");
            this.errorMessage = 'Account created, but login failed. Please try logging in.';  // Set error message
          }});
      }, 
      error: error => {
        console.log("Create Account Error: " + error.toString());
        this.errorMessage = 'Account creation failed. Please try again.';  // Set error message
      }});
  }
}
