import { Component, OnInit, OnDestroy } from "@angular/core";
import { PendulumService } from "./pendulum.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-pendulum",
  templateUrl: "./pendulum.component.html",
  styleUrls: ["./pendulum.component.scss"]
})
export class PendulumComponent implements OnInit, OnDestroy {
  private penId = "theCanvas";
  constructor(private penServ: PendulumService, private router: Router) {}

  ngOnInit() {
    this.penServ.createScene(this.penId);
    this.penServ.runScene1();
    this.penServ.animate();
    // this.router.onSameUrlNavigation='reload';
  }
  initScene(_id: string, cb) {
    this.penServ.createScene.apply(_id);
    cb();
  }
  switchScene() {
    this.penServ.switchScene();
  }

  ngOnDestroy() {}
}
