import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoinService } from './coin.service';
import { Router } from '@angular/router';

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


  onActivate(){

  }
  
  ngOnDestroy(){
    this.coinServ.deleteEverything();
    console.log('destroyed coin!');
  }
}
