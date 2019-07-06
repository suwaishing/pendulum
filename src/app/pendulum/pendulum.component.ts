import { Component, OnInit } from '@angular/core';
import { PendulumService } from './pendulum.service';

@Component({
  selector: 'app-pendulum',
  templateUrl: './pendulum.component.html',
  styleUrls: ['./pendulum.component.scss']
})
export class PendulumComponent implements OnInit {
  private penId='pendulumCanvas';
  constructor(private penServ: PendulumService) { }

  ngOnInit() {
    this.penServ.createScene(this.penId);
    this.penServ.animate();
  }

}
