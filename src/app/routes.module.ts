import { NgModule } from '@angular/core';
import { Routes,RouterModule  } from '@angular/router'
import { NormalComponent } from './normal/normal.component';


const appRoutes: Routes = [

    { path: '', pathMatch: 'full', redirectTo: 'normal' },
    { path: 'coin', loadChildren: './big-module/big-module.module#BigModuleModule',data:{name: 'coin'} },
    { path: 'normal', component: NormalComponent,data:{name: 'normal'}},
    { path: 'pendulum', loadChildren: './pen-module/pen-module.module#PenModuleModule',data:{name: 'pendulum'}}
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
  })

export class AppRoutingModule { }