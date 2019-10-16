import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { PendulumComponent } from "./pen-module/pendulum/pendulum.component";
import { NormalComponent } from "./normal/normal.component";
import { AppRoutingModule } from "./routes.module";

@NgModule({
  declarations: [
    AppComponent
    // NormalComponent,
    // NavComponent
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
