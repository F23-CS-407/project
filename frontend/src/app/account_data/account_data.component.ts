import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account-data',
  templateUrl: './account_data.component.html',
  styleUrls: ['./account_data.component.css']
})
export class AccountDataComponent implements OnInit {
  private backend_addr: string = "http://localhost:8080/api";

  user = {
    name: '', // Initialize as empty string
    password: '', // Initialize as empty string
    description: '', // Initialize as empty string
  };

  editingName = false;
  editingPassword = false;
  editingDescription = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch user data from the backend during component initialization
    this.fetchUserData();
  }

  fetchUserData() {
    const options = { withCredentials: true };
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: userData => {
        // Populate the user object with the fetched data
        this.user.name = userData.username;
        this.user.description = userData.description;
        // Password should not be fetched
      },
      error: error => {
        console.error('Failed to fetch user data:', error);
      }
    });
  }

  toggleEditing(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
    } else if (field === 'password') {
      this.editingPassword = !this.editingPassword;
    } else if (field === 'description') {
      this.editingDescription = !this.editingDescription;
    }
  }

  saveChanges() {
    const options = { withCredentials: true };
    if (this.editingName) {
      // Send a request to update the name
      const body = { new_username: this.user.name };
      this.http.post<any>(this.backend_addr + "/change_username", body, options).subscribe({
        next: response => {
          console.log('Name updated successfully:', response);
          this.editingName = false; // Disable editing mode after success
        },
        error: error => {
          console.error('Failed to update name:', error) // Show an error message
        }
      });
    }

    if (this.editingPassword) { // Password
      // Send a request to update the password
      const body = { new_password: this.user.password };
      this.http.post<any>(this.backend_addr + "/change_password", body, options).subscribe({
        next: response => {
          console.log('Password updated successfully:', response);
          this.editingPassword = false; // Disable editing mode after success
        },
        error: error => {
          console.error('Failed to update password:', error);
        }
      });
    }

    if (this.editingDescription) {
      // Send request to update the description
      const body = { new_description: this.user.description };
      this.http.post<any>(this.backend_addr + "/change_description", body, options).subscribe({
        next: response => {
          console.log('Description updated successfully:', response);
          this.editingDescription = false; // Disable editing mode after success
        },
        error: error => {
          console.error('Failed to update description:', error); // Display error message 
        }
      });
    }
  }
}
