import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserInterface } from 'src/app/interfaces/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  visible: boolean = false;
  current_user?: UserInterface;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.fetchUserProfile();
    this.settingsForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    this.userService.user.subscribe(userData => {
      this.current_user = userData;
      this.settingsForm.patchValue({
        username: userData.username,
        description: userData.bio ,
      });
    });
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  updateSettings(event: Event) {
    event.preventDefault();
    if (this.settingsForm.valid) {
      // ... logic to update settings ...
    }
  }

  editProfile() {
    this.settingsForm.enable();
  }

  saveProfile() {
    // Logic to save the updated profile information
  }

  signOut() {
    // Logic to call the logout endpoint
  }

  deleteAccount() {
    // Logic to call the delete_user endpoint
  }
}
