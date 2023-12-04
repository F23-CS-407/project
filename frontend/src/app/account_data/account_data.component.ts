import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileUploadService } from '../file-upload.service';

@Component({
  selector: 'app-account-data',
  templateUrl: './account_data.component.html',
  styleUrls: ['./account_data.component.css'],
})
export class AccountDataComponent implements OnInit {
  private backend_addr: string = 'http://localhost:8080/api';

  user = {
    name: '', // Initialize as empty string
    password: '', // Initialize as empty string
    bio: '', // Initialize as empty string
    old_password: '',
  };

  editingName = false;
  editingPassword = false;
  editingDescription = false;

  constructor(private router: Router, private http: HttpClient, private fileUploadService: FileUploadService) {}

  ngOnInit() {
    // Fetch user data from the backend during component initialization
    this.fetchUserData();
  }

  fetchUserData() {
    const options = { withCredentials: true };
    this.http.get<any>(this.backend_addr + '/user_info', options).subscribe({
      next: (userData) => {
        // Populate the user object with the fetched data
        this.user.name = userData.username;
        this.user.bio = userData.description;
        // Password should not be fetched
      },
      error: (error) => {
        console.error('Failed to fetch user data:', error);
      },
    });
  }

  saveUsername() {
    this.saveField('username', this.user.name);
  }

  savePassword() {
    this.saveField('password', this.user.password);
  }

  saveDescription() {
    this.saveField('description', this.user.bio);
  }

  loading: boolean = false;
  file: File | null = null;
  public onPictureChange(event : any) {
    if (event && event.target && event.target.files && event.target.files.length >= 1){
      this.file = event.target.files[0];
    }
  }
  savePicture() {
    // Goal: call this.saveField()
    if (this.file !== null) {
      this.loading = !this.loading;

      // Call upload service to upload file
      this.fileUploadService.upload(this.file).subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            this.loading = false;
          }
        }
      );
    }
  }


  private saveField(field: string, value: string) {
    const options = { withCredentials: true };

    const body = { ['new_' + field]: value };
    if (field == 'password') {
      body['old_password'] = this.user.old_password;
    }

    this.http
      .post<any>(`${this.backend_addr}/change_${field}`, body, options)
      .subscribe(
        (response) => {
          console.log(`${field} updated successfully:`, response);
        },
        (error) => {
          console.error(`Failed to update ${field}:`, error);
        },
      );
  }

  signOut() {
    const options = { withCredentials: true };
    this.http.delete<any>(this.backend_addr + '/logout', options).subscribe({
      next: (logout_response) => {
        // On success
        console.log(logout_response);

        // Redirect to login page
        this.router.navigate(['/login']);
      },
      error: (error_response) => {
        if (error_response.error.text == 'Logged out successfully') {
          // Success
          // Redirect to login page
          this.router.navigate(['/login']);
        }
        console.log(error_response);
      },
    });
  }

  deleteAction() {
    this.router.navigate(['/permadelete']);
  }
}
