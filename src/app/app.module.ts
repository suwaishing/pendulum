import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CoinComponent } from './coin/coin.component';
import { PendulumComponent } from './pendulum/pendulum.component';

@NgModule({
  declarations: [
    AppComponent,
    CoinComponent,
    PendulumComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
