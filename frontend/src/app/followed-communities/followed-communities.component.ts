import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-profile',
    templateUrl: './followed-communities.component.html',
    styleUrls: ['./followed-communities.component.css']
})
export class FollowedCommunitiesComponent {
    private backend_addr : string = "http://localhost:8080/api";

    private urlParams: URLSearchParams = new URLSearchParams(window.location.search);
}