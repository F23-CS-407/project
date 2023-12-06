import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PermadeleteComponent } from './permadelete/permadelete.component';
import { NewCommunityDialogComponent } from './new-community-dialog/new-community-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommentComponent } from './comment/comment.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { NewBoardComponent } from './new-board/new-board.component';
import { PostComponent } from './post/post.component';
@NgModule({
  declarations: [
    MenuBarComponent,
    SettingsDialogComponent,
    PermadeleteComponent,
    NewCommunityDialogComponent,
    CommentComponent,
    NewBoardComponent,
    PostComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    MenuBarComponent,
    SettingsDialogComponent,
    PermadeleteComponent,
    NewCommunityDialogComponent,
    CommentComponent,
    PostComponent,
  ],
})
export class SharedModule {}
