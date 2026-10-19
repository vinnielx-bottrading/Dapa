# BREAK THE CITY — Prototype Scope v0.1

## Goal

Build the smallest playable version that proves the main loop: **destroy → raise chaos → attract police → get arrested → review score → replay**.

This is a scope document, not a claim that the prototype has already been implemented.

## Build target

- Static HTML/CSS/JavaScript.
- HTML5 Canvas scene.
- One compact map.
- No backend, login, database or build tool required.
- Deploy through GitHub and Vercel.
- Desktop keyboard controls plus basic mobile touch controls.

## Required systems

| System | Minimum implementation | Acceptance check |
|---|---|---|
| Start screen | Play, controls, mute | Play starts a fresh run |
| Player | 8-direction movement | Player moves and cannot pass solid boundaries |
| Map | One city block | Streets, sidewalks, buildings and props are readable |
| Props | At least 5 breakable prop instances | Each can score only once per run |
| Feedback | Brief particles, sprite state or screen feedback | Every valid hit is visible |
| Score | Chaos Score and destroyed count | Values update once per destroyed object |
| Wanted Level | 0–4 levels | Level rises at clear thresholds |
| Police | Capped unit count, basic chase | Police approach player without teleporting |
| Capture | Proximity plus short timer | Arrest is understandable and repeatable |
| Game Over | Stats and retry | Retry resets score, props and police |
| Mobile | Touch movement and action | Main actions work on a narrow viewport |
| Deployment | Static hosting | Production URL loads without missing assets |

## Suggested defaults for first playtest

These are initial tuning values and can change:
- Small prop: 50 points.
- Medium prop: 100 points.
- Large prop: 150 points.
- Wanted Level: based on cumulative Chaos Meter.
- Arrest: police must remain near the player for a short capture duration.
- Police units: hard cap to protect performance.
- Particle count: hard cap to protect performance.

## Suggested implementation order

1. Canvas setup, responsive resize and game loop.
2. Player movement and collision.
3. Static city map and prop interaction.
4. Destruction state, score and feedback.
5. Wanted Level state.
6. Police movement and capture.
7. Game Over UI and restart.
8. Mobile controls, pause and mute.
9. Production testing on Vercel.

## Explicitly excluded

Do not build these in v0.1:
- Full building collapse or rigid-body simulation.
- Crowds or realistic traffic.
- Multiplayer or online leaderboards.
- Account system or database.
- Large map or procedural generation.
- Complex pathfinding.
- Paid assets without a confirmed license.

## Definition of done

The prototype is complete when a player can start a run, move, destroy at least five props, raise the Wanted Level, experience a police chase, get arrested, see the final statistics and restart without refreshing the page. It must also be usable on a mobile viewport and deploy successfully as a static Vercel project.
