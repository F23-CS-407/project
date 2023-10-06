import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    MenuBarComponent  // Declare MenuBarComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    MenuBarComponent  // Export MenuBarComponent
  ] 
})
export class SharedModule { }
