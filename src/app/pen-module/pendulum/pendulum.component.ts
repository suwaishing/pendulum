import { Component, OnInit, OnDestroy } from '@angular/core';
import { PendulumService } from './pendulum.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pendulum',
  templateUrl: './pendulum.component.html',
  styleUrls: ['./pendulum.component.scss']
})
export class PendulumComponent implements OnInit,OnDestroy {
  private penId='pendulumCanvas';
  constructor(private penServ: PendulumService, private router:Router) { }

  ngOnInit() {
    this.penServ.createScene(this.penId);
    
    this.penServ.animate();
    // this.router.onSameUrlNavigation='reload';

  }

  ngOnDestroy(){
    this.penServ.deleteEverything();
    console.log('destroyed pendulum!')
  }
}
