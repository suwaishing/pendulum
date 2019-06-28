import { Component, OnInit } from '@angular/core';
import { CoinService } from './coin.service';

@Component({
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.sass']
})
export class CoinComponent implements OnInit {
  private coinId= 'coinCanvas';

  constructor(private coinServ: CoinService) { }

  ngOnInit() {
    this.coinServ.createScene(this.coinId);
    this.coinServ.animate();
  }

}
