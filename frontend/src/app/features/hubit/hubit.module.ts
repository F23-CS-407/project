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
import { BoardsComponent } from './boards/boards.component';
@NgModule({
  declarations: [
    HubitComponent, // Declare HubitComponent
    HomeComponent,
    CommunityComponent,
    NewPostComponent,
    ProfileComponent,
    SettingsComponent,
    CommunityHomeComponent,
    BoardsComponent,
  ],
  imports: [
    CommonModule,
    HubitRoutingModule,
    SharedModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatSnackBarModule,
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
    ProfileComponent,
    SettingsComponent,
    CommunityHomeComponent,
    BoardsComponent,
  ],
})
export class HubitModule {}
