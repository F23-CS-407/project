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

  constructor(private router: Router) {
    this.getUsername();
  }

  getUsername() {
    console.log(sessionStorage.getItem("username"));
    if (sessionStorage.getItem("username")) {
      this.username = sessionStorage.getItem("username")?.toString();
    } else {
      // Open popup (dialog)

    }

  }

}