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

  saveUsername() {
    this.saveField('new_name', this.user.name);
  }

  savePassword() {
    this.saveField('new_password', this.user.password);
  }

  saveDescription() {
    this.saveField('new_description', this.user.description);
  }


  private saveField(field: string, value: string) {
    const options = { withCredentials: true };
    const body: Record<string, string> = {};

    body[field] = value;

    this.http.post<any>(`${this.backend_addr}/change_${field}`, body, options)
      .subscribe(
        (response) => {
          console.log(`${field} updated successfully:`, response);
        },
        (error) => {
          console.error(`Failed to update ${field}:`, error);
        }
      );
  }
}