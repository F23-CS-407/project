import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';  // Import RouterModule

import { HubitRoutingModule } from './hubit-routing.module';
import { HubitComponent } from './hubit.component';
import { HomeComponent } from './home/home.component';
import { CommunityComponent } from './community/community.component';
import { PostComponent } from './post/post.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from 'src/app/components/shared.module';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    HubitComponent,  // Declare HubitComponent
    HomeComponent,
    CommunityComponent,
    PostComponent,
    ProfileComponent,
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
    ReactiveFormsModule,
    RouterModule  // Add RouterModule to imports
  ],
  exports: [
    HubitComponent,
    HomeComponent,
    CommunityComponent,
    PostComponent,
    ProfileComponent,
  ]
})
export class HubitModule { }
