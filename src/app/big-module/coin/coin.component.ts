import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoinService } from './coin.service';

@Component({
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.scss']
})
export class CoinComponent implements OnInit, OnDestroy{
  private coinId= 'coinCanvas';

  constructor(
    private coinServ: CoinService
  ) {
   }
  ngOnInit() {
    this.coinServ.createScene(this.coinId);
    this.coinServ.animate();
  };

  ngOnDestroy(){
    this.coinServ.deleteEverything();
    console.log('destroyed coin!');
  }
}
