import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { UserInterface } from 'src/app/interfaces/user';
import { take } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  usernameForm: FormGroup;
  descriptionForm: FormGroup;
  passwordForm: FormGroup;

  username: string = '';
  description: string = '';
  password: string = '';
  newPassword: string = '';

  hasDescLength: boolean = false;
  errorMessage: string = '';
  successUser: string = '';
  successBio: string = '';
  successPass: string = '';

  visible: boolean = false;
  hasUpper = false;
  hasLower = false;
  hasNumber = false;
  hasMinLength = false;
  match = false;

  current_user?: UserInterface;
  loading: boolean = true;
  pictureLoading: boolean = false;
  file: File | null = null;

  constructor(
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private fb: FormBuilder,
  ) {
    this.usernameForm = this.fb.group({
      username: ['', Validators.required],
    });

    this.descriptionForm = this.fb.group({
      description: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: ['', Validators.required],
      },
      {
        validator: this.keyMatchValidator(),
      },
    );
  }

  // VALIDATOR --> key requirements
  keyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasMinLength = value.length >= 8;

      if (hasUppercase && hasLowercase && hasNumber && hasMinLength) {
        return null;
      }

      return { passwordInvalid: true };
    };
  }

  // VALIDATOR --> key match
  keyMatchValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('newPassword')?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }

  onPasswordChange() {
    const value = this.passwordForm.get('password')?.value;
    this.hasUpper = /[A-Z]/.test(value);
    this.hasLower = /[a-z]/.test(value);
    this.hasNumber = /\d/.test(value);
    this.hasMinLength = value.length >= 8;
    this.match =
      this.passwordForm.get('password')?.value ===
      this.passwordForm.get('newPassword')?.value;

    this.errorMessage = '';
  }

  onBioChange() {
    const desc = this.descriptionForm.get('description')?.value;
    this.hasDescLength = desc.length >= 25;
  }

  ngOnInit(): void {
    this.userService.loading.subscribe((isLoading) => {
      this.loading = isLoading;
      if (!isLoading) {
        this.fetchUserProfile();
      }
    });
  }

  fetchUserProfile() {
    this.userService.user.pipe(take(1)).subscribe(
      (userData) => {
        if (userData) {
          this.current_user = userData;
          this.username = userData.username;
          this.description = userData.bio;
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      },
    );
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  updateUsername() {
    const username = this.usernameForm.get('username')?.value;
    if (username && typeof username === 'string') {
      if (this.current_user && username !== this.current_user.username) {
        this.userService.changeUsername(username);
        this.successUser = 'New Username Saved';
        this.current_user.username = username; 
        this.usernameForm.reset(); 
      }
    }
  }

  updateDescription() {
    const description = this.descriptionForm.get('description')?.value;
    if (
      description &&
      typeof description === 'string' &&
      description !== this.current_user?.bio &&
      this.current_user
    ) {
      this.userService.changeDescription(description);
      this.successBio = 'Saved';
      this.current_user.bio = description;
      this.descriptionForm.reset();
    }
  }

  updatePassword() {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const password = this.passwordForm.get('currentPassword')?.value;
    if (
      newPassword &&
      typeof newPassword === 'string' &&
      password &&
      typeof password === 'string'
    ) {
      this.userService.changePassword(newPassword, password);
      this.successPass = 'Saved';
      this.passwordForm.reset();
    }
  }


  public onPictureChange(event : any) {
    if (event && event.target && event.target.files && event.target.files.length >= 1){
      this.file = event.target.files[0];
    }
  }
  savePicture() {
    // Goal: call this.saveField()
    if (this.file !== null) {
      this.pictureLoading = !this.pictureLoading;

      // Call upload service to upload file
      this.fileUploadService.upload(this.file).subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            this.pictureLoading = false;
          }
        }
      );
    }
  }

  signOut() {
    this.userService.logoutUser();
  }

  deleteAccount() {
    const password = this.passwordForm.get('password')?.value;
    if (password && typeof password === 'string') {
      this.userService.deleteUser(password);
    } else {
      // Handle error - password required
      console.error('Password is required to delete account');
    }
  }


  // signOut() {
  //   const options = { withCredentials: true };
  //   this.http.delete<any>(this.backend_addr + '/logout', options).subscribe({
  //     next: (logout_response) => {
  //       // On success
  //       console.log(logout_response);

  //       // Redirect to login page
  //       this.router.navigate(['/login']);
  //     },
  //     error: (error_response) => {
  //       if (error_response.error.text == 'Logged out successfully') {
  //         // Success
  //         // Redirect to login page
  //         this.router.navigate(['/login']);
  //       }
  //       console.log(error_response);
  //     },
  //   });
  // }

  // deleteAction() {
  //   this.router.navigate(['/permadelete']);
  // }
}
