import { NgModule } from '@angular/core';
import { Routes,RouterModule  } from '@angular/router'
import { NormalComponent } from './normal/normal.component';


const appRoutes: Routes = [

    { path: '', pathMatch: 'full', redirectTo: 'pendulum' },
    { path: 'coin', loadChildren: './big-module/big-module.module#BigModuleModule' },
    { path: 'normal', component: NormalComponent},
    { path: 'pendulum', loadChildren: './pen-module/pen-module.module#PenModuleModule'}
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
  })

export class AppRoutingModule { }