
import { Component } from '@angular/core';

@Component({
  selector: 'app-account-data',
  templateUrl: './account-data.component.html',
  styleUrls: ['./account-data.component.css']
})
export class AccountDataComponent {
  user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
  };
  editingName = false;
  edtingPassword = false;
  editingEmail = false;

  toggleEditing(field: string): void {
    if (field == 'name')  {
      this.editingName = !this.editingName;
    }  else if (field == 'name')  {
        this.editingName = !this.editingName;
    } else if (field == 'email') {
      this.editingEmail = !this.editingEmail;
    }

  }

  updateAccount(): void {
    // TODO: Make a backend API call to update the user's account data
    // Example: this.userService.updateAccountData(this.user).subscribe((response) => { });
  }
}
