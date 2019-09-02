import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendulumComponent } from './pendulum/pendulum.component';

const routes: Routes = [
  {path: '', component: PendulumComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PenModuleRoutingModule { }
