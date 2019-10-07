import {
  trigger,
  transition,
  style,
  query,
  group,
  animateChild,
  animate,
  keyframes,
  sequence
} from "@angular/animations";

export const btnAnimations = trigger("btnAnimations", [
  transition("* <=> *", [
    sequence([
      style({ opacity: 0 }),
      animate(
        "500ms",
        keyframes([
          style({ opacity: 0, transform: "scale(0)", offset: 0 }),
          style({ opacity: 0.7, transform: "scale(1.1)", offset: 0.5 }),
          style({ opacity: 1, transform: "scale(0.89)", offset: 0.8 }),
          style({ opacity: 1, transform: "scale(1)", offset: 1 })
        ])
      )
    ])
  ])
]);

export const slideInAnimation = trigger("routeAnimations", [
  transition("* <=> *", [
    style({ position: "relative" }),
    query(
      ":enter, :leave",
      [
        style({
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%"
        })
      ],
      {
        optional: true
      }
    ),
    query(":enter", [style({ left: "-100%" })], {
      optional: true
    }),
    query(":leave", animateChild(), {
      optional: true
    }),
    group([
      query(
        ":leave",
        [
          animate(
            "800ms 100ms cubic-bezier(.37,.55,.39,.93)",
            style({ left: "100%" })
          )
        ],
        {
          optional: true
        }
      ),
      query(
        ":enter",
        [
          animate(
            "800ms 100ms cubic-bezier(.37,.55,.39,.93)",
            style({ left: "0%" })
          )
        ],
        {
          optional: true
        }
      ),
      query("@btnAnimations", animateChild(), { optional: true })
    ]),
    query(":enter", animateChild(), {
      optional: true
    }),
    query("@btnAnimations", animateChild(), { optional: true })
  ])
]);
