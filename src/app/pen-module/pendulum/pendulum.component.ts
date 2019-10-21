import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2
} from "@angular/core";
import { PendulumService } from "./pendulum.service";
import * as gs from "gsap";
// import { TweenLite } from "gsap/TweenLite";
// import { Power2 } from "gsap/EasePack";
@Component({
  selector: "app-pendulum",
  templateUrl: "./pendulum.component.html",
  styleUrls: ["./pendulum.component.scss"]
})
export class PendulumComponent implements OnInit, AfterViewInit {
  private penId = "theCanvas";
  @ViewChild("holdBtn")
  private holdBtn: ElementRef;
  constructor(private penServ: PendulumService, private renderer: Renderer2) {}

  ngOnInit() {
    this.penServ.createScene(this.penId);
    this.penServ.disableScene2();
    this.penServ.runScene1();
    // this.penServ.firstInitCoinAndBox();
    this.penServ.animate();
    // this.router.onSameUrlNavigation='reload';
  }
  ngAfterViewInit() {
    //Animate button
    const holdTrigger = this.holdBtn.nativeElement;

    const spinner = ".spinner";
    gs.TweenLite.fromTo(
      ".hold_trigger",
      1,
      { scale: 0.0001 },
      { scale: 1, ease: gs.Power2.easeOut }
    ).delay(3.5);
    gs.TweenLite.set(spinner, { strokeDashoffset: 720 });
    const tween = gs.TweenLite.to(spinner, 0.72, {
      strokeDashoffset: 0,
      paused: true,
      onComplete: () => {
        this.switchScene();
      }
    });
    this.renderer.listen(holdTrigger, "mousedown", () => {
      tween.play();
    });
    this.renderer.listen(holdTrigger, "touchstart", () => {
      tween.play();
    });

    this.renderer.listen(holdTrigger, "mouseup", () => {
      tween.reverse();
    });
    this.renderer.listen(holdTrigger, "touchend", () => {
      tween.reverse();
    });
  }
  switchScene() {
    this.penServ.switchScene();
  }
}
