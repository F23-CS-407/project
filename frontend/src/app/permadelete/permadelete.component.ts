import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-permadelete',
  templateUrl: './permadelete.component.html',
  styleUrls: ['./permadelete.component.css']
})
export class PermadeleteComponent {
  deleteAccount_button_disabled: boolean = false;

  private backend_addr : string = "/api";// Deletes the account after the corresponding delete button is confirmed.
  constructor(private router: Router, private http: HttpClient) {

  }
  deleteAccount(password: string) {
    const body = {"password" : password};
    const options = { withCredentials : true, body: body };
    this.http.delete<any>(this.backend_addr + "/delete_user", options).subscribe({
      next: delete_response => {          // On success
        console.log(delete_response);
        
        // Redirect to main page
        this.router.navigate(['/']);
      },
      error: error_response => {
        if (error_response.error.text == "Deleted account") {   // Success
          // Redirect to main page
          this.router.navigate(['/']);
        }
        console.log(error_response);
      }
    });
  }
}