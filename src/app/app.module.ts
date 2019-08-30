import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CoinComponent } from './coin/coin.component';
import { PendulumComponent } from './pendulum/pendulum.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routes';
import { NormalComponent } from './normal/normal.component';

@NgModule({
  declarations: [
    AppComponent,
    CoinComponent,
    PendulumComponent,
    NormalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes,{onSameUrlNavigation:'reload'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
