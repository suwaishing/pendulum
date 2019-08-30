import {trigger, animate, style, group, animateChild, query, stagger, transition} from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
  // transition('* <=> *', [
  //   /* order */
  //   /* 1 */ query(':enter, :leave', ...),
  //   /* 2 */ query('.block', style({ opacity: 0 })),
  //   /* 3 */ group([  // block executes in parallel
  //       query(':enter', [...]),
  //       query(':leave', [...]),
  //   ]),
  //     /* 4 */ query(':enter .block', stagger(400, [
  //       style({ transform: 'translateY(100px)' }),
  //       animate('1s ease-in-out', 
  //         style({ transform: 'translateY(0px)', opacity: 1 })),
  //   ])),
  // ])
])