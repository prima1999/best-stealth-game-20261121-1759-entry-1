// Whisper Gallery — the museum level.
// One job: build the floor plan, answer collision and line-of-sight questions.

import {
  TILE,
  COLS,
  ROWS,
  PLAY_TOP,
  WALL_RECTS,
  CRATE_TILES,
  BUSH_TILES,
  RELICS,
  PLAYER_START,
  EXIT_RECT,
  tileCenterX,
  tileCenterY,
} from "./config.js";

export function rectFromTiles(tileX, tileY, tilesWide, tilesHigh) {
  return {
    x: tileX * TILE,
    y: PLAY_TOP + tileY * TILE,
    width: tilesWide * TILE,
    height: tilesHigh * TILE,
  };
}

export function buildLevel(seedText) {
  const walls = WALL_RECTS.map((w) => rectFromTiles(w.tileX, w.tileY, w.tilesWide, w.tilesHigh));
  const crates = CRATE_TILES.map(([x, y]) => rectFromTiles(x, y, 1, 1));
  const bushes = BUSH_TILES.map(([x, y]) => ({
    x: tileCenterX(x),
    y: tileCenterY(y),
    radius: 24,
    tileX: x,
    tileY: y,
  }));
  const relics = RELICS.map((r) => ({
    id: r.id,
    name: r.name,
    x: tileCenterX(r.tileX),
    y: tileCenterY(r.tileY),
    taken: false,
    sparkle: 0,
  }));
  const exit = rectFromTiles(EXIT_RECT.tileX, EXIT_RECT.tileY, EXIT_RECT.tilesWide, EXIT_RECT.tilesHigh);
  const rugs = [
    { x: 5 * TILE, y: PLAY_TOP + 5 * TILE, width: 6 * TILE, height: 3 * TILE },
    { x: 21 * TILE, y: PLAY_TOP + 5 * TILE, width: 6 * TILE, height: 3 * TILE },
    { x: 13 * TILE, y: PLAY_TOP + 14 * TILE, width: 6 * TILE, height: 2 * TILE },
  ];
  return {
    seedText,
    cols: COLS,
    rows: ROWS,
    walls,
    crates,
    bushes,
    relics,
    rugs,
    exit,
    playerStart: { x: tileCenterX(PLAYER_START.tileX), y: tileCenterY(PLAYER_START.tileY) },
  };
}

export function solidRects(level) {
  return level.walls.concat(level.crates);
}

export function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height;
}

export function moveCircle(level, x, y, radius, dx, dy) {
  const solids = solidRects(level);
  let nextX = x + dx;
  let nextY = y + dy;
  const playWidth = COLS * TILE;
  const playHeight = ROWS * TILE;
  nextX = Math.max(radius, Math.min(playWidth - radius, nextX));
  nextY = Math.max(PLAY_TOP + radius, Math.min(PLAY_TOP + playHeight - radius, nextY));
  const blockedX = solids.some((r) => circleHitsRect(nextX, y, radius, r));
  if (!blockedX) {
    x = nextX;
  }
  const blockedY = solids.some((r) => circleHitsRect(x, nextY, radius, r));
  if (!blockedY) {
    y = nextY;
  }
  return { x, y, blockedX, blockedY };
}

export function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) {
    return true;
  }
  const edges = [
    [rect.x, rect.y, rect.x + rect.width, rect.y],
    [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height],
    [rect.x, rect.y + rect.height, rect.x, rect.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    if (segmentsCross(x1, y1, x2, y2, ax, ay, bx, by)) {
      return true;
    }
  }
  return false;
}

export function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = direction(x3, y3, x4, y4, x1, y1);
  const d2 = direction(x3, y3, x4, y4, x2, y2);
  const d3 = direction(x1, y1, x2, y2, x3, y3);
  const d4 = direction(x1, y1, x2, y2, x4, y4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export function direction(ax, ay, bx, by, cx, cy) {
  return (cx - ax) * (by - ay) - (bx - ax) * (cy - ay);
}

export function hasLineOfSight(level, x1, y1, x2, y2) {
  const solids = solidRects(level);
  for (const rect of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) {
      return false;
    }
  }
  return true;
}

export function pointInBush(level, x, y) {
  return level.bushes.some((b) => {
    const dx = x - b.x;
    const dy = y - b.y;
    return dx * dx + dy * dy < b.radius * b.radius;
  });
}

export function relicsTaken(level) {
  return level.relics.filter((r) => r.taken).length;
}

export function allRelicsTaken(level) {
  return level.relics.every((r) => r.taken);
}
