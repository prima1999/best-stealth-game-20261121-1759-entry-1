// Whisper Gallery — all canvas drawing.
// One job: floor, walls, cover, cones, characters, HUD, menus and end screens.

import {
  TILE,
  COLS,
  ROWS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HUD_HEIGHT,
  PLAY_TOP,
  VISION_RANGE,
  VISION_HALF_ANGLE,
  DETECTION_SUSPICIOUS_AT,
  DETECTION_CHASE_AT,
  RELIC_TOTAL,
  COLORS,
  formatTime,
} from "./config.js";
import { allRelicsTaken, relicsTaken } from "./world.js";

function drawFloor(ctx, level, timeNow) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const light = (row + col) % 2 === 0;
      ctx.fillStyle = light ? COLORS.floorLight : COLORS.floorDark;
      ctx.fillRect(col * TILE, PLAY_TOP + row * TILE, TILE, TILE);
    }
  }
  for (const rug of level.rugs) {
    ctx.fillStyle = COLORS.rug;
    ctx.fillRect(rug.x + 6, rug.y + 6, rug.width - 12, rug.height - 12);
    ctx.strokeStyle = COLORS.rugEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(rug.x + 10, rug.y + 10, rug.width - 20, rug.height - 20);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let col = 0; col <= COLS; col += 1) {
    ctx.beginPath();
    ctx.moveTo(col * TILE, PLAY_TOP);
    ctx.lineTo(col * TILE, PLAY_TOP + ROWS * TILE);
    ctx.stroke();
  }
  for (let row = 0; row <= ROWS; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, PLAY_TOP + row * TILE);
    ctx.lineTo(COLS * TILE, PLAY_TOP + row * TILE);
    ctx.stroke();
  }
  void timeNow;
}

function drawWallsAndCover(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    ctx.fillStyle = COLORS.wallEdge;
    ctx.fillRect(wall.x, wall.y, wall.width, 4);
    ctx.fillRect(wall.x, wall.y, 4, wall.height);
  }
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, PLAY_TOP, CANVAS_WIDTH, 6);
  ctx.fillRect(0, CANVAS_HEIGHT - 6, CANVAS_WIDTH, 6);
  ctx.fillRect(0, PLAY_TOP, 6, CANVAS_HEIGHT - PLAY_TOP);
  ctx.fillRect(CANVAS_WIDTH - 6, PLAY_TOP, 6, CANVAS_HEIGHT - PLAY_TOP);
  for (const crate of level.crates) {
    ctx.fillStyle = COLORS.crate;
    ctx.fillRect(crate.x + 3, crate.y + 3, crate.width - 6, crate.height - 6);
    ctx.strokeStyle = COLORS.crateEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(crate.x + 5, crate.y + 5, crate.width - 10, crate.height - 10);
    ctx.beginPath();
    ctx.moveTo(crate.x + 5, crate.y + 5);
    ctx.lineTo(crate.x + crate.width - 5, crate.y + crate.height - 5);
    ctx.moveTo(crate.x + crate.width - 5, crate.y + 5);
    ctx.lineTo(crate.x + 5, crate.y + crate.height - 5);
    ctx.stroke();
  }
  for (const bush of level.bushes) {
    ctx.fillStyle = COLORS.bush;
    ctx.beginPath();
    ctx.arc(bush.x, bush.y, bush.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bushEdge;
    ctx.beginPath();
    ctx.arc(bush.x - 8, bush.y - 6, 9, 0, Math.PI * 2);
    ctx.arc(bush.x + 9, bush.y + 5, 8, 0, Math.PI * 2);
    ctx.arc(bush.x + 2, bush.y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRelicsAndExit(ctx, level, timeNow) {
  const unlocked = allRelicsTaken(level);
  const pulse = 0.75 + 0.25 * Math.sin(timeNow * 3);
  for (const relic of level.relics) {
    if (relic.taken) continue;
    ctx.save();
    ctx.translate(relic.x, relic.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.relic;
    ctx.globalAlpha = pulse;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#8a6d1f";
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -9, 18, 18);
    ctx.restore();
    ctx.fillStyle = "#fff7cc";
    ctx.beginPath();
    ctx.arc(relic.x, relic.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const exit = level.exit;
  ctx.fillStyle = unlocked ? COLORS.exit : "#3f6212";
  ctx.globalAlpha = unlocked ? 0.55 + 0.3 * pulse : 0.45;
  ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = unlocked ? COLORS.exit : "#a3e635";
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x + 2, exit.y + 2, exit.width - 4, exit.height - 4);
  ctx.fillStyle = "#052e16";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(unlocked ? "EXIT OPEN" : "EXIT LOCKED", exit.x + exit.width / 2, exit.y + exit.height / 2);
}

function drawVisionCone(ctx, guard) {
  const color = guard.state === "chase" ? "rgba(239, 68, 68, 0.34)" : COLORS.cone;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, VISION_RANGE, guard.angle - VISION_HALF_ANGLE, guard.angle + VISION_HALF_ANGLE);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = guard.state === "chase" ? "rgba(239,68,68,0.6)" : COLORS.coneEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuard(ctx, guard, timeNow) {
  drawVisionCone(ctx, guard);
  const bob = Math.sin(guard.stepPhase) * 1.5;
  ctx.fillStyle = guard.state === "patrol" ? guard.color : guard.state === "suspicious" ? "#f5a524" : "#ef4444";
  ctx.beginPath();
  ctx.arc(guard.x, guard.y + bob * 0.3, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(guard.x + Math.cos(guard.angle) * 6, guard.y + Math.sin(guard.angle) * 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(guard.state === "patrol" ? "?" : "!", guard.x, guard.y - 20);
  ctx.fillStyle = "#e8eaf2";
  ctx.font = "11px sans-serif";
  ctx.fillText(guard.name, guard.x, guard.y + 26);
  void timeNow;
}

function drawPlayer(ctx, player, timeNow) {
  const bob = player.moving ? Math.sin(player.stepPhase) * 1.5 : 0;
  if (player.clickTarget) {
    ctx.strokeStyle = "rgba(45, 212, 191, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.clickTarget.x, player.clickTarget.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob * 0.3, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.playerDark;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#134e4a";
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.angle) * 6, player.y + Math.sin(player.angle) * 6, 5, 0, Math.PI * 2);
  ctx.fill();
  if (player.hidden) {
    ctx.fillStyle = "#bbf7d0";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HIDDEN IN BUSH", player.x, player.y - 24);
  }
  if (player.sneaking) {
    ctx.fillStyle = "#e8eaf2";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("sneaking", player.x, player.y + 28);
  }
  void timeNow;
}

function drawLight(ctx, player) {
  const gradient = ctx.createRadialGradient(player.x, player.y, 60, player.x, player.y, 330);
  gradient.addColorStop(0, "rgba(2, 6, 23, 0)");
  gradient.addColorStop(1, "rgba(2, 6, 23, 0.42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, PLAY_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAY_TOP);
}

function drawDetectionBar(ctx, player) {
  const barX = 560;
  const barY = 20;
  const barWidth = 220;
  const barHeight = 16;
  ctx.fillStyle = "#0b0f1a";
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
  const fraction = player.detection / 100;
  ctx.fillStyle = fraction < DETECTION_SUSPICIOUS_AT ? COLORS.safe : fraction < DETECTION_CHASE_AT ? COLORS.warning : COLORS.danger;
  ctx.fillRect(barX, barY, barWidth * fraction, barHeight);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("DETECTION", barX - 92, barY + barHeight / 2);
  ctx.fillText(Math.round(player.detection) + "%", barX + barWidth + 10, barY + barHeight / 2);
  if (player.detection >= DETECTION_CHASE_AT) {
    ctx.fillStyle = COLORS.danger;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("SPOTTED — BREAK LINE OF SIGHT!", barX + barWidth + 62, barY + barHeight / 2);
  }
}

function drawMinimap(ctx, level, guards, player) {
  const mapX = CANVAS_WIDTH - 178;
  const mapY = 8;
  const mapW = 170;
  const mapH = 48;
  const scaleX = mapW / (COLS * TILE);
  const scaleY = mapH / (ROWS * TILE);
  ctx.fillStyle = "rgba(11, 15, 26, 0.9)";
  ctx.fillRect(mapX - 4, mapY - 4, mapW + 8, mapH + 8);
  ctx.strokeStyle = "#475569";
  ctx.strokeRect(mapX - 4, mapY - 4, mapW + 8, mapH + 8);
  for (const wall of level.walls) {
    ctx.fillStyle = "#7d8aa5";
    ctx.fillRect(mapX + wall.x * scaleX, mapY + (wall.y - PLAY_TOP) * scaleY, wall.width * scaleX, wall.height * scaleY);
  }
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(mapX + level.exit.x * scaleX, mapY + (level.exit.y - PLAY_TOP) * scaleY, 6, 4);
  for (const relic of level.relics) {
    if (relic.taken) continue;
    ctx.fillStyle = COLORS.relic;
    ctx.beginPath();
    ctx.arc(mapX + relic.x * scaleX, mapY + (relic.y - PLAY_TOP) * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const guard of guards) {
    ctx.fillStyle = guard.color;
    ctx.beginPath();
    ctx.arc(mapX + guard.x * scaleX, mapY + (guard.y - PLAY_TOP) * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + (player.y - PLAY_TOP) * scaleY, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHud(ctx, level, guards, player, elapsed, message) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("WHISPER GALLERY", 16, 22);
  ctx.fillStyle = COLORS.hudMuted;
  ctx.font = "13px sans-serif";
  ctx.fillText("Relics " + relicsTaken(level) + "/" + RELIC_TOTAL + "  ·  " + formatTime(elapsed) + "  ·  Alerts " + player.alerts, 16, 46);
  drawDetectionBar(ctx, player);
  drawMinimap(ctx, level, guards, player);
  if (message) {
    ctx.fillStyle = "#fef3c7";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, CANVAS_WIDTH / 2, HUD_HEIGHT - 8);
  }
}

export function drawWorld(ctx, level, guards, player, timeNow) {
  drawFloor(ctx, level, timeNow);
  drawRelicsAndExit(ctx, level, timeNow);
  drawWallsAndCover(ctx, level);
  for (const guard of guards) {
    drawGuard(ctx, guard, timeNow);
  }
  drawPlayer(ctx, player, timeNow);
  drawLight(ctx, player);
}

export function drawTitle(ctx, level, guards, player, timeNow) {
  drawWorld(ctx, level, guards, player, timeNow);
  ctx.fillStyle = "rgba(2, 6, 23, 0.78)";
  ctx.fillRect(0, PLAY_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAY_TOP);
  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 64px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WHISPER GALLERY", CANVAS_WIDTH / 2, 260);
  ctx.fillStyle = "#e8eaf2";
  ctx.font = "22px Georgia, serif";
  ctx.fillText("A night-museum stealth heist — steal three relics, slip past the guards, reach the exit unseen.", CANVAS_WIDTH / 2, 312);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "17px sans-serif";
  ctx.fillText("Move  WASD or Arrow keys  ·  Click to walk there  ·  Hold Shift to sneak  ·  Hold Space to sprint (loud!)", CANVAS_WIDTH / 2, 360);
  ctx.fillText("Bushes hide you. Crates and walls block a guard's sight. Watch the cones — and the detection meter.", CANVAS_WIDTH / 2, 388);
  ctx.fillText("Guards patrol, grow suspicious, then give chase. Break line of sight and the meter falls back.", CANVAS_WIDTH / 2, 416);
  ctx.fillStyle = "#2dd4bf";
  ctx.fillRect(CANVAS_WIDTH / 2 - 130, 460, 260, 56);
  ctx.fillStyle = "#052e2b";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("START THE HEIST", CANVAS_WIDTH / 2, 489);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText("Press Enter or click START — sound starts on your first click.", CANVAS_WIDTH / 2, 548);
  void timeNow;
}

export function drawEnd(ctx, won, elapsed, alerts, relics) {
  ctx.fillStyle = won ? "rgba(6, 40, 24, 0.82)" : "rgba(40, 6, 10, 0.82)";
  ctx.fillRect(0, PLAY_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAY_TOP);
  ctx.fillStyle = won ? "#4ade80" : "#f87171";
  ctx.font = "bold 58px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(won ? "CLEAN GETAWAY" : "CAUGHT IN THE GALLERY", CANVAS_WIDTH / 2, 300);
  ctx.fillStyle = "#e8eaf2";
  ctx.font = "21px sans-serif";
  ctx.fillText(
    won
      ? "You slipped out with all three relics — the museum never knew you were there."
      : "A guard spotted you and closed in. Study the patrols, use the bushes, and try again.",
    CANVAS_WIDTH / 2,
    352,
  );
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "18px sans-serif";
  ctx.fillText("Time " + formatTime(elapsed) + "   ·   Relics " + relics + "/" + RELIC_TOTAL + "   ·   Alerts " + alerts, CANVAS_WIDTH / 2, 400);
  ctx.fillStyle = "#2dd4bf";
  ctx.fillRect(CANVAS_WIDTH / 2 - 130, 448, 260, 56);
  ctx.fillStyle = "#052e2b";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("PLAY AGAIN  (R)", CANVAS_WIDTH / 2, 477);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText("Press R or click PLAY AGAIN to restart the heist.", CANVAS_WIDTH / 2, 540);
}

export function drawPaused(ctx) {
  ctx.fillStyle = "rgba(2, 6, 23, 0.66)";
  ctx.fillRect(0, PLAY_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAY_TOP);
  ctx.fillStyle = "#e8eaf2";
  ctx.font = "bold 44px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", CANVAS_WIDTH / 2, 380);
  ctx.font = "18px sans-serif";
  ctx.fillText("Press P or Esc to keep sneaking.", CANVAS_WIDTH / 2, 424);
}
