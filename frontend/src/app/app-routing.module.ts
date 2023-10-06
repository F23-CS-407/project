import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermadeleteComponent } from './permadelete/permadelete.component';

const routes: Routes = [{path: 'permadelete', component: PermadeleteComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
