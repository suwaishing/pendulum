import { Routes } from '@angular/router'
import { CoinComponent } from './coin/coin.component';
import { PendulumComponent } from './pendulum/pendulum.component';
import { NormalComponent } from './normal/normal.component';


export const appRoutes: Routes = [

    { path: '', component: CoinComponent },
    { path: 'coin', component: CoinComponent},
    { path: 'normal', component: NormalComponent},
    { path: 'pendulum', component: PendulumComponent}
]