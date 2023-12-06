import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HubitComponent } from './hubit.component';
import { HomeComponent } from './home/home.component';
import { CommunityComponent } from './community/community.component';
import { NewPostComponent } from './new_post/new_post.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { CommunityHomeComponent } from './community-home/community-home.component';

const routes: Routes = [
  {
    path: '',
    component: HubitComponent,
    children: [
      {
        path: 'home',
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
        path: 'post',
        component: NewPostComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: '',
        redirectTo: 'home',
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
