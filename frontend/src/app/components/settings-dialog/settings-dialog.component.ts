import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css'],
})
export class SettingsDialogComponent {
  private backend_addr: string = '/api';
  errorMessage: string = ''; // To hold error messages

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    private http: HttpClient,
    private router: Router,
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }

  signOut() {
    // API call to logout endpoint
    this.http
      .delete(this.backend_addr + '/logout', { withCredentials: true })
      .subscribe(
        (response) => {
          console.log('Logout successful:', response);
          this.router.navigate(['/intro']); // Redirect to 'intro' route
          this.closeDialog();
        },
        (error) => {
          console.error('Logout failed:', error);
          this.errorMessage = 'Logout failed. Please try again.'; // Set error message
        },
      );
  }

  deleteAccount() {
    // API call to delete user endpoint
    const password = prompt(
      'Please enter your password to confirm account deletion:',
    );
    if (password) {
      const body = JSON.stringify({ password: password }); // Convert object to JSON string
      const headers = new HttpHeaders().set('Content-Type', 'application/json'); // Set content type to application/json

      // Send DELETE request with body and headers
      this.http
        .request('delete', this.backend_addr + '/delete_user', {
          body: body,
          headers: headers,
          withCredentials: true,
        })
        .subscribe(
          (response) => {
            console.log('Account deletion successful:', response);
            this.router.navigate(['/intro']); // Redirect to 'intro' route
            this.closeDialog();
          },
          (error) => {
            console.error('Account deletion failed:', error);
            this.errorMessage = 'Account deletion failed. Please try again.'; // Set error message
          },
        );
    }
  }
}
