import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-permadelete',
  templateUrl: './permadelete.component.html',
  styleUrls: ['./permadelete.component.css']
})
export class PermadeleteComponent {

  private backend_addr : string = "http://localhost:8080/api";// Deletes the account after the corresponding delete button is confirmed.
  constructor(private router: Router, private http: HttpClient) {

  }
  deleteAccount(password: string) {
    const body = {"password" : password};
    const options = { withCredentials : true };
    this.http.post<any>(this.backend_addr + "/delete_user", body, options).subscribe({
      next: delete_response => {          // On success
        console.log(delete_response);
      },
      error: error_response => {
        console.log("couldn't delete user");
      }
    });
  }
}