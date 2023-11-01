import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

import { User } from "../../models/User";
import { Alias } from "../../models/Alias";
import { Post } from "../../models/Post";
import { Community } from "../../models/Community";

@Component({
  selector: 'app-account-data',
  templateUrl: './account_data.component.html',
  styleUrls: ['./account_data.component.css']
})
export class AccountDataComponent {
  private backend_addr: string = "http://localhost:8080/api";

  user = {
    name: 'John Doe',
    password: '',
    description: 'This is my profile description',
    profilePicture: 'profile.jpg'
  };

  editingName = false;
  editingPassword = false;
  editingDescription = false;

  constructor(private http: HttpClient) {}

  toggleEditing(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
    } else if (field === 'email') {
      this.editingPassword = !this.editingPassword;
    } else if (field === 'description') {
      this.editingDescription = !this.editingDescription;
    }
  }

  saveChanges() {
    if (this.editingName) {
      // Send a request to update the name
      const options = { withCredentials: true };
      const body = { new_name: this.user.name };
      
      this.http.post<any>(this.backend_addr + "/change_name", body, options).subscribe({
        next: response => {
          console.log('Name updated successfully:', response);
          this.editingName = false; // Disable editing mode after success
        },
        error: error => {
          console.error('Failed to update name:', error);
          // Handle the error, e.g., show an error message
        }
      });
    }

    if (this.editingPassword) { // Change 'email' to 'password'
      // Send a request to update the password
      const options = { withCredentials: true };
      const body = { new_password: this.user.password }; // Change 'email' to 'password'
      
      this.http.post<any>(this.backend_addr + "/change_password", body, options).subscribe({
        next: response => {
          console.log('Password updated successfully:', response);
          this.editingPassword = false; // Change editingEmail to editingPassword
        },
        error: error => {
          console.error('Failed to update password:', error);
        }
      });
    }

    if (this.editingDescription) {
      // Send a request to update the description
      const options = { withCredentials: true };
      const body = { new_description: this.user.description };
      
      this.http.post<any>(this.backend_addr + "/change_description", body, options).subscribe({
        next: response => {
          console.log('Description updated successfully:', response);
          this.editingDescription = false; // Disable editing mode after success
        },
        error: error => {
          console.error('Failed to update description:', error);
          // Handle the error, e.g., show an error message
        }
      });
    }
  }
}