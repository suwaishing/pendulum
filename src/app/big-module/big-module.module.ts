import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BigModuleRoutingModule } from './big-module-routing.module';
import { CoinComponent } from './coin/coin.component';

@NgModule({
  declarations: [CoinComponent],
  imports: [
    CommonModule,
    BigModuleRoutingModule
  ]
})
export class BigModuleModule { }
