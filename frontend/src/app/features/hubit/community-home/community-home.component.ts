import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewCommunityDialogComponent } from '../../../components/new-community-dialog/new-community-dialog.component';
import { Router } from '@angular/router';
import { UserInterface } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { CommunityInterface } from 'src/app/interfaces/community';
import { CommunityService } from 'src/app/services/community.service';

@Component({
  selector: 'app-community-home',
  templateUrl: './community-home.component.html',
  styleUrls: ['./community-home.component.css'],
})
export class CommunityHomeComponent {

  // Logged in user info
  currentUser?: UserInterface;
  logged_in: boolean = false;
  self_id: string = 'not logged in'; 
  followed_communities: Array<string> = [];
  private requestedCommunities = new Set<string>();
  communities: CommunityInterface[] = [];


  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private communityService: CommunityService,
  ) {}

  ngOnInit() {
    this.userService.fetchUserProfile();

    this.userService.loading.subscribe(loading => {
      if (!loading) {
        this.userService.user.subscribe((userData: UserInterface) => {
          if (userData && userData._id) {
            console.log(userData); //For testing
            this.currentUser = userData;
            this.followed_communities = userData.followed_communities;
            this.self_id = userData._id;
            this.logged_in = true;
            this.fetchCommunities(userData.followed_communities);
          } else {
            console.log('No user data available');
            this.router.navigate(['/intro']);
          }
        });
      }
    });
  }

  fetchCommunities(communityIds: string[]) {
    communityIds.forEach(id => {
      if (!this.requestedCommunities.has(id)) {
        this.requestedCommunities.add(id);
        this.communityService.fetchCommunity(id);
        this.communityService.community.subscribe((communityData: CommunityInterface) => {
          if (communityData && communityData._id && !this.communities.find(c => c._id === communityData._id)) {
            this.communities.push(communityData);
          }
        });
      }
    });
  }

  clickCommunity(community: CommunityInterface) {
    this.router.navigate(['/hubit/community'], { queryParams: { community: community._id } });
  }


  openNewCommunityDialog(): void {
    const dialogRef = this.dialog.open(NewCommunityDialogComponent, {
      width: 'auto',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Community Created:', result);
      this.router.navigate(['/hubit/community'], { queryParams: { community: result } });
    });
  }
}
