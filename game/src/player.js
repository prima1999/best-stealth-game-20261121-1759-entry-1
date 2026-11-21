// Whisper Gallery — the player, Wren the lantern thief.
// One job: keyboard and click movement, sneak and sprint, relic pickups.

import {
  PLAYER_RADIUS,
  PLAYER_WALK_SPEED,
  PLAYER_SNEAK_SPEED,
  PLAYER_SPRINT_SPEED,
  RELIC_PICKUP_RADIUS,
  RELIC_TOTAL,
} from "./config.js";
import { moveCircle, pointInBush } from "./world.js";

export function createPlayer(startX, startY) {
  return {
    x: startX,
    y: startY,
    radius: PLAYER_RADIUS,
    angle: 0,
    detection: 0,
    sneaking: false,
    sprinting: false,
    moving: false,
    hidden: false,
    stepPhase: 0,
    stepSoundAt: 0,
    clickTarget: null,
    relics: 0,
    alerts: 0,
  };
}

export function updatePlayer(level, player, input, dt, timeNow, events) {
  let moveX = 0;
  let moveY = 0;
  if (input.isDown("KeyW") || input.isDown("ArrowUp")) moveY -= 1;
  if (input.isDown("KeyS") || input.isDown("ArrowDown")) moveY += 1;
  if (input.isDown("KeyA") || input.isDown("ArrowLeft")) moveX -= 1;
  if (input.isDown("KeyD") || input.isDown("ArrowRight")) moveX += 1;
  if (moveX !== 0 || moveY !== 0) {
    player.clickTarget = null;
  }
  if (moveX === 0 && moveY === 0 && player.clickTarget) {
    const dx = player.clickTarget.x - player.x;
    const dy = player.clickTarget.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) {
      player.clickTarget = null;
    } else {
      moveX = dx / distance;
      moveY = dy / distance;
    }
  }
  const length = Math.hypot(moveX, moveY);
  player.moving = length > 0;
  player.sneaking = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
  player.sprinting = !player.sneaking && input.isDown("Space") && player.moving;
  let speed = PLAYER_WALK_SPEED;
  if (player.sneaking) speed = PLAYER_SNEAK_SPEED;
  if (player.sprinting) speed = PLAYER_SPRINT_SPEED;
  if (length > 0) {
    const stepX = (moveX / length) * speed * dt;
    const stepY = (moveY / length) * speed * dt;
    const moved = moveCircle(level, player.x, player.y, player.radius, stepX, stepY);
    player.x = moved.x;
    player.y = moved.y;
    player.angle = Math.atan2(moveY, moveX);
    player.stepPhase += dt * (player.sprinting ? 11 : player.sneaking ? 5 : 8);
    if (timeNow - player.stepSoundAt > (player.sprinting ? 0.28 : 0.42)) {
      player.stepSoundAt = timeNow;
      events.push({ type: "step", loud: player.sprinting });
    }
  }
  player.hidden = pointInBush(level, player.x, player.y);
  for (const relic of level.relics) {
    if (relic.taken) continue;
    const distance = Math.hypot(player.x - relic.x, player.y - relic.y);
    if (distance < RELIC_PICKUP_RADIUS) {
      relic.taken = true;
      player.relics += 1;
      events.push({ type: "relic", name: relic.name, count: player.relics, total: RELIC_TOTAL });
    }
  }
  return player;
}
