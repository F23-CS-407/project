import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

import { HubitRoutingModule } from './hubit-routing.module';
import { HubitComponent } from './hubit.component';
import { HomeComponent } from './home/home.component';
import { CommunityComponent } from './community/community.component';
import { NewPostComponent } from './new_post/new_post.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from 'src/app/components/shared.module';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { CommunityHomeComponent } from './community-home/community-home.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { BoardsComponent } from './boards/boards.component';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { FollowedCommunitiesComponent } from './followed-communities/followed-communities.component';
import { PostComponent } from './post/post.component';
import { MatListModule } from '@angular/material/list';
import { ViewDirectMessagesComponent } from './view-direct-messages/view-direct-messages.component';
import { BugReportComponent } from './bug_report/bug_report.component';
import { FeedComponent } from './feed/feed.component';
import { SavedComponent } from './saved/saved.component';
import { LikedComponent } from './liked/liked.component';
@NgModule({
  declarations: [
    HubitComponent, // Declare HubitComponent
    HomeComponent,
    CommunityComponent,
    NewPostComponent,
    PostComponent,
    ProfileComponent,
    SettingsComponent,
    CommunityHomeComponent,
    BoardsComponent,
    DirectMessageComponent,
    FollowedCommunitiesComponent,
    ViewDirectMessagesComponent,
    BugReportComponent,
    FeedComponent,
    SavedComponent,
    LikedComponent,
  ],
  imports: [
    CommonModule,
    HubitRoutingModule,
    SharedModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatSnackBarModule,
    MatBadgeModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
  ],
  exports: [
    HubitComponent,
    HomeComponent,
    CommunityComponent,
    NewPostComponent,
    PostComponent,
    ProfileComponent,
    SettingsComponent,
    CommunityHomeComponent,
    BoardsComponent,
    DirectMessageComponent,
    FollowedCommunitiesComponent,
    BugReportComponent,
    FeedComponent,
    SavedComponent,
    LikedComponent,
  ],
})
export class HubitModule {}
