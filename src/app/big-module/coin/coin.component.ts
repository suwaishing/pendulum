import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { CoinService } from "./coin.service";
import { Router } from "@angular/router";
import { TweenMax, Power2 } from "gsap/TweenMax";

@Component({
  selector: "app-coin",
  templateUrl: "./coin.component.html",
  styleUrls: ["./coin.component.scss"]
})
export class CoinComponent implements OnInit, AfterViewInit, OnDestroy {
  private coinId = "coinCanvas";
  private currentPage;

  constructor(private coinServ: CoinService, private elementRef: ElementRef) {
    this.currentPage = this.elementRef.nativeElement;
  }
  ngOnInit() {
    this.coinServ.createScene(this.coinId);
    // this.sceneIn();
  }
  ngAfterViewInit() {
    this.coinServ.animate();
  }
  ngOnDestroy() {
    // this.sceneOut();
    this.coinServ.deleteEverything();
  }
  sceneIn() {
    TweenMax.fromTo(
      this.currentPage,
      1,
      { opacity: 0 },
      { opacity: 1, ease: Power2.easeIn }
    );
  }
  sceneOut() {
    TweenMax.fromTo(
      this.currentPage,
      1,
      { opacity: 1 },
      {
        opacity: 0,
        onComplete: this.coinServ.deleteEverything,
        ease: Power2.easeOut
      }
    );
  }
}
