import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { Draggable } from "gsap/Draggable";
import { TweenLite } from "gsap/TweenLite";
import { filter } from "rxjs/operators";
import { TweenMax, Power2 } from "gsap/TweenMax";
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  ActivatedRoute,
  Event
} from "@angular/router";
import { slideInAnimation, btnAnimations } from "./route-animation";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
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
  animations: [slideInAnimation, btnAnimations]
})
export class AppComponent implements OnInit {
  title = "saisen";

  private currentLink: string;
  private isLandscape = false;
  linkText: string;
  btnColor: string;
  nextLink: string;
  private button;
  constructor(private router: Router, private eleRef: ElementRef) {}
  ngOnInit() {
    this.getCurrentLink();
  }
  getClasses() {}
  getBtnColor(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
      default:
        return "btn-purple";
      case "/pendulum":
        return "btn-blue";
      case "/coin":
        return "btn-red";
    }
  }
  getBtnAnim(event) {
    let target = event.target.classList
      .remove("btn-anim")
      .then(event.target.classList.add("btn-anim"));
  }
  getNextLink(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
      default:
        return "/coin";
      case "/coin":
        return "/pendulum";
      case "/pendulum":
        return "/normal";
    }
  }
  getLinkText(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
      default:
        return "Start";
      case "/coin":
        return "Next";
      case "/pendulum":
        return "Restart";
    }
  }
  getCurrentLink() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentLink = event.url;
        this.linkText = this.getLinkText(this.currentLink);
        this.btnColor = this.getBtnColor(this.currentLink);
        this.nextLink = this.getNextLink(this.currentLink);
        // this.getBtnAnim(event);
      }
    });
  }
  aniBtn() {}
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
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }
}
