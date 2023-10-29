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
  user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    profilePicture: 'profile.jpg'
  };

  editingName = false;
  editingEmail = false;
  editingPassword = false;
  editingProfilePicture = false;

  toggleEditing(field: string) {
    if (field === 'name') {
      this.editingName = !this.editingName;
    } else if (field === 'email') {
      this.editingEmail = !this.editingEmail;
    } else if (field === 'password') { 
      this.editingPassword = !this.editingPassword;
    } else if (field === 'profilePicture') {
      this.editingProfilePicture = !this.editingProfilePicture;
    }
  }

  updateProfilePicture(event: any) {
    const file = event.target.files[0];
    // Handle the file upload and update the user's profile picture
    // Set the user's profile picture URL here.
  }

  saveChanges() {
    // Send an HTTP request to update the user's account data on the backend based on the changes made to this.user.
    
  }
}
