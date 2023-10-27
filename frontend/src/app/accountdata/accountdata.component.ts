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
  templateUrl: './accountdata.component.html',
  styleUrls: ['./accountdata.component.css']
})
export class AccountDataComponent {
    user: any;
    isNameEditing: boolean;
    isEmailEditing: boolean;
    isProfilePictureEditing: boolean;
    updatedName: string;
    updatedEmail: string;
    updatedProfilePicture: string;
  
    constructor() {
      this.user = { name: 'John Doe', email: 'john@example.com', profilePicture: 'profile.jpg' };
      this.isNameEditing = false;
      this.isEmailEditing = false;
      this.isProfilePictureEditing = false;
      this.updatedName = '';
      this.updatedEmail = '';
      this.updatedProfilePicture = '';
    }
  
    editName() {
        this.isNameEditing = true;
        this.updatedName = this.user.name;
      }
    
      // Add saveName function to handle saving the name
      saveName() {
        this.user.name = this.updatedName; // Update the name with the edited value
        this.isNameEditing = false; // Exit edit mode
        // Send an HTTP request to update the user's name on the backend
      }
    
      editEmail() {
        this.isEmailEditing = true;
        this.updatedEmail = this.user.email;
      }
    
      // Add saveEmail function to handle saving the email
      saveEmail() {
        this.user.email = this.updatedEmail; // Update the email with the edited value
        this.isEmailEditing = false; // Exit edit mode
        // Send an HTTP request to update the user's email on the backend
      }
    
      editProfilePicture() {
        this.isProfilePictureEditing = true;
        this.updatedProfilePicture = this.user.profilePicture;
      }
    
      // Add saveProfilePicture function to handle saving the profile picture
      saveProfilePicture() {
        this.user.profilePicture = this.updatedProfilePicture; // Update the profile picture with the edited value
        this.isProfilePictureEditing = false; // Exit edit mode
        // Send an HTTP request to update the user's profile picture on the backend
      }
    
    // ... other code
  }
  