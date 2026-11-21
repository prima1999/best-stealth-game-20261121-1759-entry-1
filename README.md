# best-stealth-game-20261121-1759-entry-1

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/prima1999/best-stealth-game-20261121-1759-entry-1/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/prima1999/best-stealth-game-20261121-1759-entry-1/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**Whisper Gallery** — a complete, original top-down 2D stealth game. You are Wren, a lantern thief
in a night museum. Steal three relics (the Jade Fox, the Moon Pearl and the Sun Mask), slip past
four patrolling guards with vision cones, hide in bushes and behind crates, and reach the green
exit unseen. A detection meter rises when a guard sees you and falls when you break line of
sight — guards grow suspicious, investigate, then give chase. Sneak with Shift, sprint with
Space (loud!), or click to walk somewhere. Win by escaping with all three relics; get caught
and the heist ends.

Built for [make.fun's "Make the best stealth game" bounty](https://make.fun/bounty/best-stealth-game-20261121-1759).

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in a desktop browser. No build step, no libraries, no
network requests — pure stdlib JavaScript, canvas-drawn art and WebAudio beeps.

Deterministic screenshots: open `?shot=start&seed=gallery-1`, `?shot=play&seed=gallery-1`
or `?shot=end&seed=gallery-1` to stage the title, mid-play and win screens.

## Files

- `game/index.html` — the playable game page
- `game/src/config.js` — tuning, colours, level layout data
- `game/src/random.js` — seeded randomness for deterministic staging
- `game/src/world.js` — level, collision and line of sight
- `game/src/guards.js` — patrols, vision cones and detection
- `game/src/player.js` — movement, sneak, sprint and relic pickups
- `game/src/audio.js` — procedural WebAudio sounds
- `game/src/render.js` — all canvas drawing, HUD, minimap and screens
- `game/src/input.js` — keyboard and mouse input
- `game/src/shots.js` — deterministic screenshot staging
- `game/src/main.js` — game loop and state machine
- `main.ts` — copies `game/` and `screenshots/` to the output and writes `dossier.json`

---

<sub>Entered on [make.fun](https://make.fun/?ref=0xdown&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
