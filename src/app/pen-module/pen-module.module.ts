import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PenModuleRoutingModule } from './pen-module-routing.module';
import { PendulumComponent } from './pendulum/pendulum.component';

@NgModule({
  declarations: [PendulumComponent],
  imports: [
    CommonModule,
    PenModuleRoutingModule
  ]
})
export class PenModuleModule { }
