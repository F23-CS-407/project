import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';

// For Angular Material Library - https://material.angular.io/components/categories
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';         // Here is the component being imported
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { NewPostComponent } from './new_post/new_post.component';
import { PermadeleteComponent } from './permadelete/permadelete.component';
import { PostComponent } from './post/post.component';
import { CommunityComponent } from './community/community.component';
import { NewCommunityComponent } from './new-community/new-community.component';
import { FollowedCommunitiesComponent } from './followed-communities/followed-communities.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,                                               // Here is the componenet being delcared
    HomeComponent,
    SignupComponent,
    ProfileComponent,
    NewPostComponent,
    PermadeleteComponent,
    PostComponent,
    CommunityComponent,
    NewCommunityComponent,
    FollowedCommunitiesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent },
      {path: 'login', component: LoginComponent},                  // This is a new path. Can be found at localhost:port/login
      {path: 'signup', component: SignupComponent},
      {path: 'profile', component: ProfileComponent},
      {path: 'new_post', component: NewPostComponent},
      {path: 'post', component: PostComponent},
      {path: 'new_community', component: NewCommunityComponent},
      {path: 'community', component: CommunityComponent},
      {path: 'followed_communities', component: FollowedCommunitiesComponent}
    ]),
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatSelectModule,
    FormsModule, ReactiveFormsModule,
    MatAutocompleteModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

