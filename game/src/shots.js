// Whisper Gallery — deterministic screenshot staging.
// One job: read ?shot= and ?seed= and pose the game for a real render.

import { tileCenterX, tileCenterY } from "./config.js";

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot") || "";
  const seed = params.get("seed") || "gallery-1";
  return { shot, seed };
}

export function applyShotStaging(game, shot) {
  if (shot === "start") {
    game.state = "title";
    return;
  }
  if (shot === "play") {
    game.state = "playing";
    game.player.x = tileCenterX(8);
    game.player.y = tileCenterY(9);
    game.player.angle = 0;
    game.player.detection = 60;
    game.level.relics[0].taken = true;
    game.level.relics[1].taken = true;
    game.player.relics = 2;
    game.elapsed = 87;
    game.message = "Two relics pocketed — one to go. Stay behind the crate.";
    game.messageUntil = 999999;
    const guard = game.guards[0];
    guard.x = tileCenterX(13);
    guard.y = tileCenterY(9);
    guard.angle = Math.PI;
    guard.state = "suspicious";
    guard.stateTime = 1.2;
    guard.lastSeenX = guard.x;
    guard.lastSeenY = guard.y;
    const second = game.guards[3];
    second.x = tileCenterX(17);
    second.y = tileCenterY(12);
    second.angle = Math.PI;
    const third = game.guards[1];
    third.x = tileCenterX(26);
    third.y = tileCenterY(2);
    third.angle = Math.PI / 2;
    third.waypoints = [{ x: tileCenterX(26), y: tileCenterY(2) }, { x: tileCenterX(29), y: tileCenterY(2) }];
    third.waypointIndex = 1;
    const fourth = game.guards[2];
    fourth.x = tileCenterX(24);
    fourth.y = tileCenterY(14);
    fourth.angle = -Math.PI / 2;
    fourth.waypoints = [{ x: tileCenterX(24), y: tileCenterY(14) }, { x: tileCenterX(28), y: tileCenterY(14) }];
    fourth.waypointIndex = 1;
    return;
  }
  if (shot === "end") {
    game.state = "won";
    game.elapsed = 214;
    game.player.alerts = 1;
    game.player.relics = 3;
    for (const relic of game.level.relics) {
      relic.taken = true;
    }
    game.player.x = tileCenterX(29);
    game.player.y = tileCenterY(1);
    return;
  }
}
