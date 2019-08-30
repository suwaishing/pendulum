import { Component, ViewChild, ElementRef, AfterViewInit, OnChanges } from '@angular/core';
import {Draggable} from "gsap/Draggable";
import {TweenLite} from "gsap/TweenLite";
import { RouterOutlet, OutletContext, Router } from '@angular/router';
import { fader, slideInAnimation, inOut } from './route-animation';
import { trigger, transition, style, group, query, animate } from '@angular/animations';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // animations: [
  //   trigger('slideInOut', [
  //     transition('* => *, :enter', [
  //       query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
  //       query(':enter', style({ transform: 'translateX(-100vw)' }), { optional: true }),
  //       query(':leave', style({ transform: 'translateX(0vw)' }), { optional: true }),

  //       group([
  //         query(':leave', [
  //           animate('500ms ease-in-out', style({
  //             transform: 'translateX(100vw)'
  //           }))
  //         ], { optional: true }),
  //         query(':enter', [
  //           animate('500ms ease-in-out', style({
  //             transform: 'translateX(0)'
  //           }))
  //         ], { optional: true })
  //       ])
  //     ])
  //   ])
  // ]
})
export class AppComponent implements OnChanges {
  title = 'saisen';
  @ViewChild('dragPoint') dragPoint: ElementRef;
  @ViewChild('dragArea') dragArea: ElementRef;
  //@ViewChild('dragVisual') dragVisual: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  constructor(private router: Router){
    
  }
  ngOnChanges(){
    //this.ctx = this.dragVisual.nativeElement.getContext('2d');
    this.router.onSameUrlNavigation = 'reload';
  }
  // ngAfterViewInit(){
  //   Draggable.create(this.dragPoint.nativeElement,{
  //     bounds:this.dragArea.nativeElement,
  //     edgeResistance: 1,
  //     type: 'x',
  //     onDragEnd: snapStart
  //   })
  //   function snapStart() {
  //     const midVal = (this.maxX-this.minX)/2;
  //     let snapTo = (this.x>midVal)? this.maxX: this.minX;
  //     let moveTo = new TweenLite(this.target,0.7,{x:snapTo});
  //   }
  // }
  getState(outlet: RouterOutlet){
    return outlet.activatedRouteData.animation;
  }
}
