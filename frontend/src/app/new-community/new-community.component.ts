import {Component, ElementRef, ViewChild, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {COMMA, ENTER} from '@angular/cdk/keycodes';

import {NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-new-community',
  templateUrl: './new-community.component.html',
  styleUrls: ['./new-community.component.css']
})
export class NewCommunityComponent {
  private backend_addr : string = "http://localhost:8080/api";

  // Community page data
  community_name: string = "test_community";
  community_desc: string = "This is a test community that is created to post to.";

  constructor(private router : Router, private http : HttpClient) {
    // For moderator code
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((user: string | null) => (user ? this._filter(user) : this.allUsers.slice())),
    );

    this.async_constructor();
  }
  async async_constructor() {
    this.getData();
  }

  // Logged in user info
  logged_in: boolean = false;
  self_id: string = "not logged in";
  self_username: string = "no username";
  getData() {
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/user_info", options).subscribe({
      next: info_response => {          // On success
        this.logged_in = true;
        this.self_id = info_response["_id"];
        this.self_username = info_response.username;
        console.log(info_response);
      }, 
      error: error => {         // On fail
        console.log("No session: ");
        console.log(error);

        // TODO: If not logged in, redirect to another page
        //this.router.navigate(["/"]);
      }});
  }

  public filter_users(username : string) {
    // TODO: Search for users matching given pattern
    const options = { withCredentials : true };
    this.http.get<any>(this.backend_addr + "/search_users?username="+username, options).subscribe({
      next: search_users_response => {
        let count = search_users_response.length;

        // Clear users list
        this.allUsers.splice(0, this.allUsers.length);

        // Append returned users to all users list
        for (let i = 0; i < count; i++) {
          this.allUsers.push(search_users_response[i].username);
          // TODO: use objects along with search_users_reponse[i]._id
        }
      },
      error: error => {

      }});
  }

  separatorKeyCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl('');                                 // !!! DEPRECATED
  filteredUsers?: Observable<string[]>;                           // !!! DEPRECATED
  filteredMods?: Observable<moderator[]>;
  choosenUsers: string[] = ['Gary'];                              // !!! DEPRECATED
  selected_Mods: moderator[] = [];
  allUsers: string[] = ['John', 'Sam', 'Mike', 'Alan'];           // !!! DEPRECATED
  autocomplete_Mods: moderator[] = [];
  @ViewChild('modInput') modInput?: ElementRef<HTMLInputElement>;
  public search_users(partial_username : string) {
    // TODO: Call backend /search_users?username=(string)

  }
  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim(); 

    // Add to list
    if (value) {
      this.choosenUsers.push(value);
    }

    event.chipInput.clear();

    this.userCtrl.setValue(null);
  }
  public remove(user: string) {
    const index = this.choosenUsers.indexOf(user);

    if (index >= 0) {
      this.choosenUsers.splice(index, 1);
    }
  }
  public selected(event: MatAutocompleteSelectedEvent): void {
    this.choosenUsers.push(event.option.viewValue);
    if (this.modInput) {
      this.modInput.nativeElement.value = '';
    }
    this.userCtrl.setValue(null);
  }

  public create_community(community_name : string, community_desc : string, mods : string[]) {
    // Call backend /create_community
    const options = { withCredentials : true };
    const body = {
      "name" : community_name,
      "description" : community_desc,
      // TODO: Fix this later with IDs
      "mods" : [this.self_id],
    };
    this.http.post<any>(this.backend_addr + "/create_community", body, options).subscribe({
      next: create_community_response => {
        let community_id = create_community_response._id;

        this.router.navigate(["/community?community="+community_id]);

      },
      error: error => {
        // TODO: Check error statement

      }});

  }
  
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allUsers.filter(user => user.toLowerCase().includes(filterValue));
  }
}

class moderator {
  username: string = "";
  id: string = "";

  constructor(username: string, id: string) {
    this.username = username;
    this.id = id;
  }
}