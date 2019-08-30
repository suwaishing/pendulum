import {
    trigger,
    transition,
    style,
    query,
    group,
    animateChild,
    animate,
    keyframes
} from '@angular/animations';

export const fader = trigger('routeAnimations', [
    transition('* <=> *', [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                left: 0,
                width: '100%',
                opacity: 0,
                transform: 'scale(0) translateY(100%)',
            })
        ]),
        query(':enter', [
            animate('600ms ease',
                style({ opacity:1,transform:'scale(1) translateY(0)'})
            )
        ])
    ])
])
export const inOut = trigger('slideInOut', [
    transition('* => *, :enter', [
      query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
      query(':enter', style({ transform: 'translateX(-100vw)' }), { optional: true }),
      query(':leave', style({ transform: 'translateX(0vw)' }), { optional: true }),

      group([
        query(':leave', [
          animate('500ms ease-in-out', style({
            transform: 'translateX(100vw)'
          }))
        ], { optional: true }),
        query(':enter', [
          animate('500ms ease-in-out', style({
            transform: 'translateX(0)'
          }))
        ], { optional: true })
      ])
    ])
])

export const slideInAnimation = trigger('routeAnimations', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ]),
    transition('* <=> FilterPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('200ms ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ])
  ]);