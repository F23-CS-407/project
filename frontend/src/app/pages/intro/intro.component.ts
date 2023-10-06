import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}

  showRegistrationForm() {
    this.showLoginForm = false;
  }

  showLoginFormAgain() {
    this.showLoginForm = true;
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
