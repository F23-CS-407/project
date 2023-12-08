import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-hubit',
  templateUrl: './hubit.component.html',
  styleUrls: ['./hubit.component.css'],
})
export class HubitComponent implements OnInit {
  private backend_addr: string = '/api';

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userService.fetchUserProfile();
    this.userService.loading.subscribe((isLoading) => {
      if (!isLoading) {
        this.checkAuthentication();
      }
    });
  }

  checkAuthentication(): void {
    this.userService.user.subscribe((user) => {
      if (user) {
        console.log('User is authenticated:', user);
        // User is authenticated, you can now access user data
      } else {
        console.error('User is not authenticated');
        this.router.navigate(['/intro']); // Redirect to 'intro' route if not authenticated
      }
    });
  }
}
