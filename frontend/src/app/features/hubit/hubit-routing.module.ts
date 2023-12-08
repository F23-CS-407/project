import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HubitComponent } from './hubit.component';
import { HomeComponent } from './home/home.component';
import { CommunityComponent } from './community/community.component';
import { NewPostComponent } from './new_post/new_post.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { CommunityHomeComponent } from './community-home/community-home.component';
import { FollowedCommunitiesComponent } from './followed-communities/followed-communities.component';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { ViewDirectMessagesComponent } from './view-direct-messages/view-direct-messages.component';
import { PostComponent } from './post/post.component';
import { BoardsComponent } from './boards/boards.component';
import { Dir } from '@angular/cdk/bidi';
import { BugReportComponent } from './bug_report/bug_report.component';
import { FeedComponent } from './feed/feed.component';
import { SavedComponent } from './saved/saved.component';
import { LikedComponent } from './liked/liked.component';

const routes: Routes = [
  {
    path: '',
    component: HubitComponent,
    children: [
      {
        path: 'search',
        component: HomeComponent,
      },
      {
        path: 'community-dashboard',
        component: CommunityHomeComponent,
      },
      {
        path: 'community',
        component: CommunityComponent,
      },
      {
        path: 'community/:id/boards',
        component: BoardsComponent,
      },
      {
        path: 'new_post',
        component: NewPostComponent,
      },
      {
        path: 'post',
        component: PostComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'profile/followed-communities',
        component: FollowedCommunitiesComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'following',
        component: FollowedCommunitiesComponent,
      },
      {
        path: 'message',
        component: DirectMessageComponent,
      },
      {
        path: 'all_messages',
        component: ViewDirectMessagesComponent,
      },
      {
        path: "feedback",
        component: BugReportComponent,
      },
      {
        path: "feed",
        component: FeedComponent
      },
      {
        path: 'saved',
        component: SavedComponent,
      },
      {
        path: 'liked',
        component: LikedComponent,
      },
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HubitRoutingModule {}
