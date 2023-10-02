import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {

  username?: string = undefined;
  logged_in: boolean = false;

  constructor(private router: Router) {
    this.getData();
  }

  getData() {
    if (sessionStorage.getItem("username")) {
      this.username = sessionStorage.getItem("username")?.toString();
    }
    if (sessionStorage.getItem("logged_in") == "true") {
      this.logged_in = true;
    }

  }

}