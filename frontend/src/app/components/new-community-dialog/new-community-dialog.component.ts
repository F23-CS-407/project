import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-community-dialog',
  templateUrl: './new-community-dialog.component.html',
  styleUrls: ['./new-community-dialog.component.css'],
})
export class NewCommunityDialogComponent {
  private backend_addr: string = 'http://localhost:8080/api';

  newCommunityForm: FormGroup;

  // Community page data
  community_name: string = '';
  community_desc: string = '';
  hasNameLength: boolean = false;
  hasDescLength: boolean = false;

  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewCommunityDialogComponent>,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
  ) {
    this.newCommunityForm = this.fb.group({
      community_name: ['', Validators.required],
      community_desc: ['', Validators.required],
    });
    // For moderator code
    this.filtered_mods = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((mod_name) => this.filterOnValueChange(mod_name)),
    );

    this.async_constructor();
  }
  async async_constructor() {
    this.getData();
  }

  // VALIDATOR --> Name Requierement
  nameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      const hasNameLength = value.length >= 4;

      if (hasNameLength) {
        return null;
      }

      return { nameInvalid: true };
    };
  }

  onChange() {
    const name = this.newCommunityForm.get('community_name')?.value;
    const desc = this.newCommunityForm.get('community_desc')?.value;
    this.hasNameLength = name.length >= 4;
    this.hasDescLength = desc.length >= 25;
    this.errorMessage = '';
  }

  // VALIDATOR --> Description Requierement
  descValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      const hasDescLength = value.length >= 25;

      if (hasDescLength) {
        return null;
      }

      return { descInvalid: true };
    };
  }

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = 'not logged in';
  self_username: string = 'no username';
  getData() {
    const options = { withCredentials: true };
    this.http.get<any>(this.backend_addr + '/user_info', options).subscribe({
      next: (info_response) => {
        // On success
        this.logged_in = true;
        this.self_id = info_response['_id'];
        this.self_username = info_response.username;
        this.selected_mods.push(
          new moderator(this.self_username, this.self_id),
        );
        console.log(info_response);
      },
      error: (error) => {
        // On fail
        console.log('No session: ');
        console.log(error);

        // If not logged in, redirect to another page
        this.router.navigate(['/']);
      },
    });
  }

  public filter_users(username: string) {
    if (username == '') {
      // Clear list
      this.autocomplete_mods.splice(0, this.autocomplete_mods.length);
      this.userCtrl.setValue(null);

      return;
    }

    // Search for users matching given pattern
    const options = { withCredentials: true };
    this.http
      .get<any>(
        this.backend_addr + '/search_users?username=' + username,
        options,
      )
      .subscribe({
        next: (search_users_response) => {
          let count = search_users_response.length;

          // Clear users list
          this.autocomplete_mods.splice(0, this.autocomplete_mods.length);

          // Append returned users to all users list
          for (let i = 0; i < Math.min(count, 20); i++) {
            this.autocomplete_mods.push(
              new moderator(
                search_users_response[i].username,
                search_users_response[i]._id,
              ),
            );
          }
          this.userCtrl.setValue(null);
        },
        error: (error) => {},
      });
  }

  // https://stackblitz.com/edit/chip-list-with-objects-wbvz6k?file=src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.component.html
  separatorKeyCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl('');
  filtered_mods?: Observable<String[]>;
  selected_mods: moderator[] = [];
  autocomplete_mods: moderator[] = [];
  hide_chips: boolean = false;
  @ViewChild('modInput') modInput?: ElementRef<HTMLInputElement>;
  public add_mod(event: MatChipInputEvent): void {
    const mod_name = event.value;

    this.add_mod_username(mod_name);

    event.chipInput.clear();
    this.userCtrl.setValue(null);
  }

  private add_mod_username(mod_name: string) {
    // Add to list
    if (mod_name) {
      let foundMod = this.autocomplete_mods.filter(
        (mod) => mod.username == mod_name,
      );

      // Real person
      if (foundMod.length) {
        let already_added_mod = this.selected_mods.filter(
          (mod) => mod.id == foundMod[0].id,
        );

        // Person is not already a mod
        if (!already_added_mod.length) {
          this.selected_mods.push(foundMod[0]);
        }
      } else {
        // No match found, or already selected
      }
    }
  }

  public remove_mod(mod: moderator) {
    const index = this.selected_mods.indexOf(mod);

    if (index >= 0) {
      this.selected_mods.splice(index, 1);
    }
    if (this.modInput) {
      this.modInput.nativeElement.value = '';
      this.userCtrl.setValue(null);
    }
  }

  public select_mod(event: MatAutocompleteSelectedEvent): void {
    this.add_mod_username(event.option.viewValue);

    if (this.modInput) {
      this.modInput.nativeElement.value = '';
      this.userCtrl.setValue(null);
    }
  }

  private filterOnValueChange(mod_name: string | null): String[] {
    let result: String[] = [];

    // Get mods not selected
    let allModsLessSelected = this.autocomplete_mods.filter(
      (mod) => this.selected_mods.indexOf(mod) < 0,
    );

    result = allModsLessSelected.map((mod) => mod.username);
    return result;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.newCommunityForm.valid) {
      const communityName = this.newCommunityForm.get('community_name')?.value;
      const communityDesc = this.newCommunityForm.get('community_desc')?.value;
      const mods = this.selected_mods.map((mod) => mod.id);
      this.create_community(communityName, communityDesc, mods);
    } else {
      // Handle form validation errors or show a message to the user
      console.error('Form is invalid');
    }
  }

  public create_community(
    community_name: string,
    community_desc: string,
    mods: string[],
  ) {
    // Call backend /create_community
    const options = { withCredentials: true };
    const body = {
      name: community_name,
      description: community_desc,
      mods: this.selected_mods.map((mod) => mod.id),
    };
    this.http
      .post<any>(this.backend_addr + '/create_community', body, options)
      .subscribe({
        next: async (create_community_response) => {
          let community_id = create_community_response._id;
          this.dialogRef.close();
        },
        error: (error) => {
          // Check if the error response has the 'error' key and set the errorMessage accordingly
          if (error && error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage =
              'An unexpected error occurred while creating the community.';
          }

          this.newCommunityForm.get('community_name')?.setValue('');

          console.log(this.errorMessage);
        },
      });
  }
}

class moderator {
  username: string = '';
  id: string = '';

  constructor(username: string, id: string) {
    this.username = username;
    this.id = id;
  }
}
