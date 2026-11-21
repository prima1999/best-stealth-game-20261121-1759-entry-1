// Whisper Gallery — guard patrols, vision cones and detection.
// One job: move each guard along its route and work out what it can see.

import {
  GUARD_PATROL_SPEED,
  GUARD_SUSPICIOUS_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_RADIUS,
  VISION_RANGE,
  VISION_HALF_ANGLE,
  DETECTION_RISE_BASE,
  DETECTION_DECAY,
  DETECTION_SUSPICIOUS_AT,
  DETECTION_CHASE_AT,
  DETECTION_CAUGHT_AT,
  SNEAK_DETECTION_FACTOR,
  BUSH_DETECTION_FACTOR,
  SPRINT_DETECTION_FACTOR,
  NOISE_RADIUS_SPRINT,
  CATCH_DISTANCE,
  tileCenterX,
  tileCenterY,
} from "./config.js";
import { hasLineOfSight, moveCircle, pointInBush } from "./world.js";

export function createGuards(defs, seedOffset) {
  return defs.map((def, index) => {
    const startIndex = (index + seedOffset) % def.waypoints.length;
    const [startX, startY] = def.waypoints[startIndex];
    const [nextX, nextY] = def.waypoints[(startIndex + 1) % def.waypoints.length];
    return {
      name: def.name,
      color: def.color,
      x: tileCenterX(startX),
      y: tileCenterY(startY),
      angle: Math.atan2(tileCenterY(nextY) - tileCenterY(startY), tileCenterX(nextX) - tileCenterX(startX)),
      waypoints: def.waypoints.map(([wx, wy]) => ({ x: tileCenterX(wx), y: tileCenterY(wy) })),
      waypointIndex: (startIndex + 1) % def.waypoints.length,
      state: "patrol",
      stateTime: 0,
      lastSeenX: 0,
      lastSeenY: 0,
      lookAngle: 0,
      stuckTime: 0,
      stepPhase: Math.random() * 6,
    };
  });
}

export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function guardSeesPlayer(level, guard, player) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > VISION_RANGE) {
    return { sees: false, distance, strength: 0 };
  }
  const angleToPlayer = Math.atan2(dy, dx);
  const offAngle = Math.abs(angleDifference(angleToPlayer, guard.angle));
  if (offAngle > VISION_HALF_ANGLE) {
    return { sees: false, distance, strength: 0 };
  }
  if (!hasLineOfSight(level, guard.x, guard.y, player.x, player.y)) {
    return { sees: false, distance, strength: 0 };
  }
  const closeness = 1 - distance / VISION_RANGE;
  const centre = 1 - offAngle / VISION_HALF_ANGLE;
  let strength = 0.45 + 0.55 * closeness * (0.5 + 0.5 * centre);
  if (player.sneaking) strength *= SNEAK_DETECTION_FACTOR;
  if (pointInBush(level, player.x, player.y)) strength *= BUSH_DETECTION_FACTOR;
  if (player.sprinting) strength *= SPRINT_DETECTION_FACTOR;
  return { sees: true, distance, strength };
}

export function moveGuardToward(level, guard, targetX, targetY, speed, dt) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 4) {
    return true;
  }
  const stepX = (dx / distance) * speed * dt;
  const stepY = (dy / distance) * speed * dt;
  const beforeX = guard.x;
  const beforeY = guard.y;
  const moved = moveCircle(level, guard.x, guard.y, GUARD_RADIUS, stepX, stepY);
  guard.x = moved.x;
  guard.y = moved.y;
  guard.angle = Math.atan2(dy, dx);
  const actuallyMoved = Math.hypot(guard.x - beforeX, guard.y - beforeY);
  if (actuallyMoved < speed * dt * 0.25) {
    guard.stuckTime += dt;
  } else {
    guard.stuckTime = 0;
  }
  return distance < 10;
}

export function updateGuards(level, guards, player, dt, events) {
  let detection = player.detection;
  let anySees = false;
  for (const guard of guards) {
    guard.stateTime += dt;
    guard.stepPhase += dt * (guard.state === "patrol" ? 6 : 9);
    const sight = guardSeesPlayer(level, guard, player);
    if (sight.sees) {
      anySees = true;
      detection += DETECTION_RISE_BASE * sight.strength * dt;
      guard.lastSeenX = player.x;
      guard.lastSeenY = player.y;
      if (detection >= DETECTION_CHASE_AT && guard.state !== "chase") {
        guard.state = "chase";
        guard.stateTime = 0;
        events.push({ type: "chase", guard: guard.name });
      } else if (detection >= DETECTION_SUSPICIOUS_AT && guard.state === "patrol") {
        guard.state = "suspicious";
        guard.stateTime = 0;
        events.push({ type: "suspicious", guard: guard.name });
      }
    }
    if (player.sprinting && !sight.sees) {
      const noiseDistance = Math.hypot(player.x - guard.x, player.y - guard.y);
      if (noiseDistance < NOISE_RADIUS_SPRINT && guard.state === "patrol") {
        guard.state = "suspicious";
        guard.stateTime = 0;
        guard.lastSeenX = player.x;
        guard.lastSeenY = player.y;
        events.push({ type: "heard", guard: guard.name });
      }
    }
    if (guard.state === "patrol") {
      const target = guard.waypoints[guard.waypointIndex];
      const arrived = moveGuardToward(level, guard, target.x, target.y, GUARD_PATROL_SPEED, dt);
      if (arrived || guard.stuckTime > 1.2) {
        guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
        guard.stuckTime = 0;
      }
    } else if (guard.state === "suspicious") {
      const arrived = moveGuardToward(level, guard, guard.lastSeenX, guard.lastSeenY, GUARD_SUSPICIOUS_SPEED, dt);
      if (arrived) {
        guard.lookAngle += dt * 1.6;
        guard.angle = guard.lookAngle;
      }
      if (guard.stateTime > 5) {
        guard.state = "patrol";
        guard.stateTime = 0;
      }
    } else if (guard.state === "chase") {
      moveGuardToward(level, guard, player.x, player.y, GUARD_CHASE_SPEED, dt);
      if (detection < DETECTION_SUSPICIOUS_AT) {
        guard.state = "suspicious";
        guard.stateTime = 0;
      }
    }
    const touchDistance = Math.hypot(player.x - guard.x, player.y - guard.y);
    if (touchDistance < CATCH_DISTANCE) {
      detection = DETECTION_CAUGHT_AT;
    }
  }
  if (!anySees) {
    detection -= DETECTION_DECAY * dt;
  }
  player.detection = Math.max(0, Math.min(DETECTION_CAUGHT_AT, detection));
  return player.detection;
}
