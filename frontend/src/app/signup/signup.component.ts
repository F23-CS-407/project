import { Component } from '@angular/core';
//import { FormControl, Validators } from '@angular/forms';
//import {ErrorStateMatcher} from '@angular/material/core';
import {
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  constructor() {

  }

  // Error message variables
  username_taken: boolean = true;
  password_contains_special: boolean = false;
  password_contains_uppercase: boolean = true;
  password_contains_lowercase: boolean = true;
  password_contains_number: boolean = true;
  passwords_match: boolean = true;


  public create_account(username : string, password : string, passwordc : string) {
    console.log('Button clicked, ' + username + ', ' + password + ', ' + passwordc + '.');
    
    // Add logic for checking

  }

  create_account_button_enabled = false;
  
  // Input Validation for password and confirm password input fields
  static specialCharPattern = "^.*[!@#$%^&*()_+-=[]{};':\"\\|,.<>/?].*$";
  static uppercaseLetterPattern = "^.*[A-Z].*$";
  static lowercaseLetterPattern = "^.*[a-z].*$";
  static numberPattern = "^.*[0-9].*$";
  passwordFormControl = new FormControl('',[Validators.required, 
                                            Validators.minLength(8), 
                                            Validators.pattern(SignupComponent.specialCharPattern)]);
  
}
