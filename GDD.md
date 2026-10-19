# BREAK THE CITY — Game Design Document

**Version:** 0.1  
**Project:** Vinh Làm Game  
**Status:** Concept / pre-production  
**Genre:** 2D/2.5D arcade sandbox, destruction, satire  
**Platform:** Browser (desktop and mobile)

## 1. High concept

BREAK THE CITY is a compact, browser-based destruction arcade game. The player enters a fictional city block and can damage designated environmental objects. Each action adds to a Chaos Score and raises the city's response level. Police attention escalates until the player is arrested or the run otherwise ends.

The game uses cartoon exaggeration and satirical environmental details to explore a simple idea: creating chaos has consequences. It is not a realistic protest simulator and does not target real-world individuals or groups.

**Player fantasy:** “I can turn a carefully arranged city into a ridiculous mess—but the city eventually reacts.”

## 2. Design pillars

### 2.1 Immediate freedom
The player can move and experiment within seconds of loading the game. Avoid lengthy tutorials, account creation and mandatory story scenes.

### 2.2 Satisfying feedback
A successful hit should communicate impact through a quick animation, a sound cue, a small debris burst and a visible score change. Avoid effects that overwhelm the screen.

### 2.3 Escalating consequences
The more damage the player causes, the more attention they attract. Police response should be readable and fair, not random or impossible to escape.

### 2.4 Satire through the world
Use fictional slogans, absurd public notices, over-the-top advertising and exaggerated bureaucracy. The tone should be witty rather than cruel or preachy.

### 2.5 Small and shippable
A single polished city block is better than a large, empty map. Prototype destruction as state changes and particles rather than simulating every fragment physically.

## 3. Target experience

- A short session of approximately 2–5 minutes.
- Easy to understand without instructions.
- Playable with keyboard or touch controls.
- Clear escalation from exploration to pursuit to arrest.
- A satisfying end-of-run summary that encourages replay.

## 4. Core loop

1. **Explore:** move around the block and identify interactive props.
2. **Interact:** hit or otherwise activate a breakable prop.
3. **Score:** receive points and a destruction count.
4. **Escalate:** the Wanted Level rises based on accumulated chaos.
5. **Pursuit:** police units move toward the player.
6. **Arrest:** a clear capture condition ends the run.
7. **Review:** show score, objects damaged, survival time and maximum Wanted Level.
8. **Replay:** restart immediately.

## 5. Camera and visual direction

**Recommended view:** top-down with 2.5D presentation.

Use a slightly angled camera feel through sprite art, layered building facades, drop shadows, road markings and depth sorting. This gives the scene visual depth while retaining simple collision and rendering.

### Art direction
- Stylized, colorful urban environment.
- Strong silhouettes and readable interactive objects.
- Slightly exaggerated proportions and expressive impact effects.
- Fictional city signage and fictional brands.
- Dust puffs, small debris and brief screen shake, all used sparingly.
- No graphic injury detail.

### Visual readability
- Player: clear outline or contrasting clothing.
- Breakable props: distinct silhouette and hit feedback.
- Police: unmistakable color and light/siren indicator.
- Wanted Level: visible, consistent HUD indicator.
- Arrest state: pause movement, dim or blur the scene slightly, then show results.

## 6. World and map

### Prototype map
One compact block containing:
- Two or three building fronts.
- A main street and a side lane.
- Sidewalks and a few obstacles.
- A handful of breakable props.
- A clear open route for movement and pursuit.

The map should have boundaries that feel intentional (walls, road exits or decorative edges), not invisible barriers in the middle of a street.

### Future expansion
- Shopping street.
- Civic plaza.
- Industrial block.
- Night or rainy variants.
- Environmental modifiers such as slippery roads or reduced visibility.

Additional districts are not required for v0.1.

## 7. Player controls

### Desktop
- `WASD` or arrow keys: move.
- `Space` or left mouse click: attack / interact.
- `Esc` or `P`: pause.
- HUD buttons: mute and restart.

### Mobile
- Virtual directional pad or a compact joystick.
- Large action button.
- Pause and mute buttons placed away from movement controls.

The interaction range should be forgiving. Avoid requiring pixel-perfect taps.

## 8. Destruction system

For v0.1, each breakable object is a predefined entity with a small number of states:

- `intact`
- `damaged` (optional)
- `destroyed`

When a valid interaction occurs:
1. Check range and cooldown.
2. Change the object's state.
3. Spawn a small, capped particle burst.
4. Play a short sound effect.
5. Add points and increment the destruction count.
6. Increase chaos and update the Wanted Level.

Objects should not be repeatedly farmable for unlimited points. Once destroyed, they remain destroyed for the current run.

### Initial prop types
- Trash bin.
- Street sign.
- Bench or street furniture.
- Shop window panel.
- Advertising board.

A prop may use a simple sprite swap rather than dynamic physics.

## 9. Chaos Score and Wanted Level

### Chaos Score
Award points for successfully damaging a new object. Different props can have different point values, but keep values understandable.

Example balancing values (tune during playtests):
- Small prop: 50 points.
- Medium prop: 100 points.
- Large designated prop: 150 points.

These are starting values, not final balance.

### Wanted Level
Use a simple escalation model based on a hidden or visible Chaos Meter. A five-step scale is recommended:

- **Level 0 — Calm:** no active pursuit.
- **Level 1 — Alert:** police become aware of the player.
- **Level 2 — Search:** one unit moves toward the player.
- **Level 3 — Pursuit:** police actively chase.
- **Level 4 — Lockdown:** additional pressure and a higher capture risk.

Do not spawn unlimited police. Cap active units and use clear escalation thresholds.

## 10. Police AI

Keep the first version simple and predictable.

### State machine
- `patrol`: move along a short route or remain in a designated area.
- `investigate`: move toward the last known disturbance.
- `chase`: pursue the player when within detection range and the Wanted Level permits it.
- `capture`: trigger arrest when the player remains within capture range for a short, readable duration.

Police movement can use direct steering and basic obstacle avoidance. Full pathfinding is unnecessary for a small map.

### Fairness rules
- Show visual or audio cues before capture.
- Avoid teleporting police directly onto the player.
- Use a brief capture progress indicator.
- Give the player enough space to understand why the arrest occurred.

## 11. Arrest and Game Over

The run ends when a police unit maintains capture range for the configured duration, or when a future game mode introduces another explicit end condition.

The arrest screen should show:
- Final Chaos Score.
- Number of objects destroyed.
- Survival time.
- Highest Wanted Level.
- Personal best, if stored locally.
- `Play Again` button.
- Optional `How to Play` link.

Tone: satirical and concise. Example: “The city has filed a very long complaint.” Avoid real-world legal claims.

## 12. UI and UX

### Start screen
- Logo/title.
- One-sentence premise.
- Play button.
- Controls summary.
- Mute toggle.

### In-game HUD
- Chaos Score.
- Wanted Level.
- Destruction count.
- Optional survival timer.
- Pause and mute.

### Pause menu
- Resume.
- Restart run.
- Sound toggle.

### Game Over
- Arrest message.
- Run statistics.
- Retry button.

Keep the HUD compact, especially on mobile. Use large tap targets and safe margins around screen edges.

## 13. Audio

Minimum viable audio:
- Light city ambience.
- Impact sound for each prop family.
- Short destruction sound.
- Police alert or siren cue.
- Arrest sting.
- UI click.

Use original, properly licensed or public-domain assets. Provide mute controls and avoid autoplaying audio before user interaction.

## 14. Technical design

### Recommended implementation
- HTML5 Canvas for the scene.
- Vanilla JavaScript modules.
- CSS for menus, HUD and responsive layout.
- Static asset files.
- `requestAnimationFrame` game loop.
- Delta-time-based movement.
- Basic local storage for personal best, if needed.

### Rendering and performance
- Keep the map small.
- Cap particles and active police units.
- Reuse particles where practical.
- Avoid loading large texture atlases in v0.1.
- Scale the Canvas for device pixel ratio within a sensible cap.
- Pause simulation when the tab is hidden.
- Keep gameplay state separate from UI rendering.

### Deployment
The first version should be a static site deployable from GitHub to Vercel without a server, database, login provider or environment variables.

## 15. Scope

### Must have
- Start screen and playable scene.
- Player movement.
- Collision with map boundaries and obstacles.
- At least five breakable props.
- Score and destruction counter.
- Wanted Level escalation.
- Basic police chase.
- Arrest state.
- Game Over statistics and restart.
- Keyboard controls.
- Basic mobile controls.
- Mute and pause.
- README and deployment instructions.

### Should have
- Small particle effects.
- Short sound set.
- Local best score.
- Basic tutorial overlay.
- Reduced-motion option or reduced screen shake.

### Could have later
- More districts.
- Weather variants.
- Cosmetic player skins.
- Challenge modes and leaderboards.
- Additional fictional satirical events.
- Optional online score service, only if there is a clear need.

### Not in v0.1
- Multiplayer.
- Realistic crowd simulation.
- Fully destructible buildings.
- Realistic structural physics.
- Large open world.
- Backend accounts or cloud saves.
- Real-world political groups or real protest reenactments.

## 16. Success criteria

The prototype is ready for a small public test when:
- A new player can start without instructions from the developer.
- Movement and collisions work on desktop.
- Mobile controls are usable on a narrow screen.
- Destruction feedback and score updates are reliable.
- Wanted Level escalation is understandable.
- Police pursuit can lead to a fair arrest.
- Game Over and restart work repeatedly without refreshing the page.
- The game loads from a Vercel production URL without console errors.
- No essential gameplay asset depends on an unreliable external URL.

## 17. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Game feels like a repetitive button-masher | Vary prop feedback, pacing and escalation |
| Police AI feels unfair | Use clear detection and capture rules |
| Browser performance drops | Cap particles and police count; avoid full physics |
| Mobile controls obscure the scene | Use compact controls and responsive HUD |
| Satire feels preachy | Let systems and outcomes deliver the message |
| Deploy breaks due to asset paths | Use relative paths and test production build |

## 18. Future roadmap

- **v0.1 — Core prototype:** one block, destruction, score, pursuit and arrest.
- **v0.2 — Feel and polish:** better animation, sound, mobile controls and balancing.
- **v0.3 — Content update:** additional prop families and a second small environment.
- **v1.0 — Public release candidate:** accessibility checks, performance pass, clear credits and stable deployment.

## 19. One-line pitch

**BREAK THE CITY: Make a mess. Watch the city react. Face the consequences.**
