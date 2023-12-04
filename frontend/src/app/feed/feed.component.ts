import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
//import { FormControl, Validators } from '@angular/forms';
//import {ErrorStateMatcher} from '@angular/material/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent {
  private backend_addr : string = "http://localhost:8080/api";

  constructor(private router: Router, private http: HttpClient) {

  }
}
