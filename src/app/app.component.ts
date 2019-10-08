import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { Draggable } from "gsap/Draggable";
import { TweenLite } from "gsap/TweenLite";
import { TimelineMax } from "gsap/TimelineMax";
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
import { Button } from "protractor";

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
export class AppComponent implements OnInit, AfterViewInit {
  title = "saisen";

  private currentLink: string;
  private isLandscape = false;
  linkText: string;
  btnColor: string;
  nextLink: string;
  textArray: string[] = ["Start", "Next", "Restart"];
  colorArray: string[] = ["btn-purple", "btn-red", "btn-blue"];
  nextLinkArray: string[] = ["/coin", "/pendulum", "/normal"];
  @ViewChild("button") button: ElementRef;
  animateBtn = new TimelineMax({ pause: true });
  isNavEnd = false;
  constructor(private router: Router, private eleRef: ElementRef) {}
  ngOnInit() {
    this.getCurrentLink();
  }
  ngAfterViewInit() {
    this.initBtnAnimation();
    this.getBtnAnim();
  }
  getAnswer(_currentLink: string, arg: string[]): string {
    switch (_currentLink) {
      case "/normal":
      default:
        return arg[0];
      case "/coin":
        return arg[1];
      case "/pendulum":
        return arg[2];
    }
  }

  getBtnAnim() {
    const btnKeyframe: string = "btn-anim";
    const button: Element = this.button.nativeElement;
    const isAnimateActive: boolean = button.classList.contains(btnKeyframe)
      ? true
      : false;
    if (isAnimateActive || this.isNavEnd) {
      button.classList.remove(btnKeyframe);
    } else {
      button.classList.add(btnKeyframe);
    }
  }

  getCurrentLink() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentLink = event.url;
        this.linkText = this.getAnswer(this.currentLink, this.textArray);
        this.btnColor = this.getAnswer(this.currentLink, this.colorArray);
        this.nextLink = this.getAnswer(this.currentLink, this.nextLinkArray);
        this.isNavEnd = true;
      } else {
        this.isNavEnd = false;
      }
    });
  }
  initBtnAnimation() {
    const button: Element = this.button.nativeElement;
    console.log(button);
    this.animateBtn
      .from(button, 0, { left: "40%", opacity: 0 })
      .to(button, 1, { left: "50%", opacity: 0.8 })
      .to(button, 1.2, { opacity: 1 });
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
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }
}
