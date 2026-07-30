# CR League 0.8.5
Release date: 2026-07-30

## Added
- The Destiny Wheel now draws inside a chosen circuit pool — Europe, Americas, Asia, Africa, Oceania or all of them — with the pool size shown next to the picker. The choice is remembered between draws.
- A chrono run now ends the way a Grand Prix does: a flag, then a recap of what the lap earned — provisional grid slot, best lap, gap to pole and attempts used.
- Every map shows the frame rate in the same corner, so a slow screen can be reported with a number.
- A full-page map layout for the Stand and the replay is available behind `?fullmap=1`, still off by default.

## Changed
- League updates are much lighter: a season of ten races answers with 400 KB instead of 1.12 MB. Replays of older races fetch their own trace when opened, so they keep every detail.
- Link previews and the install dialog ship a quarter of the image weight they used to.
- Cars keep a consistent size on a full-page map instead of being drawn 40% larger than in a panel.
- Header buttons show icons only below 1000px, where their labels pushed the bar onto a second line.
- The result button carries the finish flag, and shows the flag alone on phones.
- Race and chrono tracking sits on the left on phones, clear of the timeline and the event markers.
- Status notifications are as wide as their message rather than a fixed width.

## Fixed
- Fixed the final classification on the Stand being hidden behind the header after a Grand Prix.
- Fixed the dotted lines from cars to the standings: none is drawn to a team the list is not showing, every listed team gets one, and they no longer cost frame time.
- Fixed the map overlays sitting too low on arcade screens, which have no header bar.
- Fixed the margin under the header on the Plan, Championship and Garage screens.
- Removed the "Result locked" panel, which repeated the skip button next to it.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run build`
- `npm run balance:gate`
- `npm run logics:validate`
