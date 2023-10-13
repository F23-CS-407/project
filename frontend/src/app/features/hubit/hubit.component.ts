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
