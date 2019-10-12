import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnInit
} from "@angular/core";
import { Draggable } from "gsap/Draggable";
import { TweenLite } from "gsap/TweenLite";
import { filter } from "rxjs/operators";
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  ActivatedRoute,
  Event
} from "@angular/router";
import { fader, slideInAnimation, inOut } from "./route-animation";
import {
  trigger,
  transition,
  style,
  group,
  query,
  animate
} from "@angular/animations";
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
  constructor(private router: Router, private route: ActivatedRoute) {}
  private currentLink: string;
  private isLandscape = false;
  linkText: string;
  btnColor: string;
  nextLink: string;
  ngOnInit() {
    this.getCurrentLink();
  }
  getClasses() {}
  getBtnColor(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
        return "btn-purple";
      case "/pendulum":
        return "btn-blue";
      // case '/coin':
      //   return 'btn-red';
      default:
        return "btn-purple";
    }
  }
  getBtnAnim(event) {
    event.target.classList.remove("btn-anim");
    setTimeout(() => {
      event.target.classList.add("btn-anim");
    }, 100);
  }
  getNextLink(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
        return "/pendulum";
      // case '/coin':
      //   return '/pendulum';
      case "/pendulum":
        return "/normal";
      default:
        return "/normal";
    }
  }
  getLinkText(_currentLink: string) {
    switch (_currentLink) {
      case "/normal":
        return "Start";
      // case '/coin':
      //   return 'Next';
      case "/pendulum":
        return "Restart";
      default:
        return "Start";
    }
  }
  getCurrentLink() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentLink = event.url;
        this.linkText = this.getLinkText(this.currentLink);
        this.btnColor = this.getBtnColor(this.currentLink);
        this.nextLink = this.getNextLink(this.currentLink);
      }
    });
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
  getState(outlet: RouterOutlet) {
    return outlet.activatedRouteData.animation;
  }
}
