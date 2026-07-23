# CHANGELOGS 0.4.1

Race replay consistency patch.

## Fixes

- Fixed profiled city-circuit pit exits so cars no longer roll backward when leaving the pit lane after a battery swap.
- Kept pit stop positions anchored to the circuit pit lane instead of moving the stopped car to the profiled racing line.
- Aligned replay finish crossings with the final classification so cars cannot visually lose positions after already crossing the finish line.
- Repaired post-pit visual gap compression so it cannot pull cars back behind the pit exit.

## Validation

- `npm run typecheck`
- `npm run test`
