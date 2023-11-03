import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroComponent } from './pages/intro/intro.component';
const routes: Routes = [
    {
        path: 'hubit',
        loadChildren: () =>
            import('./features/hubit/hubit.module').then(
                (m) => m.HubitModule
            ),
    },
    {
        path: '',
        redirectTo: 'intro',
        pathMatch: 'full',
    },
    {
        path: 'intro',
        component: IntroComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
