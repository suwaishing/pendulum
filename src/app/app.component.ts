import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
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
export class AppComponent implements OnInit {
  title = "saisen";
  constructor() {}

  ngOnInit() {}

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
  // getState(outlet: RouterOutlet) {
  //   return outlet.activatedRouteData.animation;
  // }
}
