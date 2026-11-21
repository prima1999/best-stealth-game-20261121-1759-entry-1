// Whisper Gallery — tuning and shared constants.
// One job: every number the rest of the game balances against lives here.

export const TILE = 40;
export const COLS = 32;
export const ROWS = 18;
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
export const HUD_HEIGHT = 64;
export const PLAY_TOP = HUD_HEIGHT;
export const PLAY_HEIGHT = CANVAS_HEIGHT - HUD_HEIGHT;

export const PLAYER_RADIUS = 14;
export const PLAYER_WALK_SPEED = 165;
export const PLAYER_SNEAK_SPEED = 88;
export const PLAYER_SPRINT_SPEED = 245;
export const GUARD_PATROL_SPEED = 58;
export const GUARD_SUSPICIOUS_SPEED = 92;
export const GUARD_CHASE_SPEED = 118;
export const GUARD_RADIUS = 14;

export const VISION_RANGE = 235;
export const VISION_HALF_ANGLE = 0.61;
export const DETECTION_RISE_BASE = 38;
export const DETECTION_DECAY = 24;
export const DETECTION_SUSPICIOUS_AT = 35;
export const DETECTION_CHASE_AT = 75;
export const DETECTION_CAUGHT_AT = 100;
export const SNEAK_DETECTION_FACTOR = 0.34;
export const BUSH_DETECTION_FACTOR = 0.22;
export const SPRINT_DETECTION_FACTOR = 1.55;
export const NOISE_RADIUS_SPRINT = 150;
export const CATCH_DISTANCE = 28;

export const RELIC_TOTAL = 3;
export const RELIC_PICKUP_RADIUS = 30;

export const COLORS = {
  floorLight: "#2b3242",
  floorDark: "#252c3a",
  wall: "#4a5468",
  wallEdge: "#7d8aa5",
  rug: "#5a2e35",
  rugEdge: "#7a3f47",
  crate: "#8a6a3b",
  crateEdge: "#c9a45c",
  bush: "#2e5d3a",
  bushEdge: "#57a773",
  cone: "rgba(255, 196, 66, 0.30)",
  coneEdge: "rgba(255, 196, 66, 0.55)",
  guard: "#e5484d",
  guardSuspicious: "#f5a524",
  player: "#2dd4bf",
  playerDark: "#0f766e",
  relic: "#ffd166",
  exit: "#4ade80",
  exitDark: "#166534",
  hud: "#141824",
  hudText: "#e8eaf2",
  hudMuted: "#9aa3b8",
  danger: "#ef4444",
  warning: "#f59e0b",
  safe: "#4ade80",
};

export const RELICS = [
  { id: "fox", name: "Jade Fox", tileX: 16, tileY: 2 },
  { id: "pearl", name: "Moon Pearl", tileX: 29, tileY: 9 },
  { id: "mask", name: "Sun Mask", tileX: 5, tileY: 16 },
];

export const PLAYER_START = { tileX: 2, tileY: 2 };
export const EXIT_RECT = { tileX: 29, tileY: 1, tilesWide: 2, tilesHigh: 1 };

export const WALL_RECTS = [
  { tileX: 8, tileY: 3, tilesWide: 6, tilesHigh: 1 },
  { tileX: 18, tileY: 3, tilesWide: 6, tilesHigh: 1 },
  { tileX: 8, tileY: 13, tilesWide: 6, tilesHigh: 1 },
  { tileX: 18, tileY: 13, tilesWide: 6, tilesHigh: 1 },
  { tileX: 15, tileY: 7, tilesWide: 2, tilesHigh: 4 },
  { tileX: 5, tileY: 8, tilesWide: 1, tilesHigh: 2 },
  { tileX: 26, tileY: 8, tilesWide: 1, tilesHigh: 2 },
];

export const CRATE_TILES = [
  [4, 4], [9, 6], [13, 4], [21, 6], [26, 4],
  [6, 10], [10, 9], [24, 10], [28, 11], [5, 12],
  [9, 16], [20, 16], [25, 15], [15, 14], [28, 6],
];

export const BUSH_TILES = [
  [12, 2], [18, 2], [3, 9], [29, 5], [7, 14],
  [22, 8], [16, 6], [27, 13], [4, 16], [11, 12],
];

export const GUARD_DEFS = [
  {
    name: "Mara",
    waypoints: [[5, 2], [26, 2], [26, 5], [5, 5]],
    color: "#e5484d",
  },
  {
    name: "Odo",
    waypoints: [[3, 7], [3, 15], [12, 15], [12, 7]],
    color: "#f97316",
  },
  {
    name: "Sable",
    waypoints: [[22, 7], [29, 7], [29, 14], [22, 14]],
    color: "#e5484d",
  },
  {
    name: "Ivo",
    waypoints: [[13, 9], [18, 9], [18, 12], [13, 12]],
    color: "#f97316",
  },
];

export function tileCenterX(tileX) {
  return tileX * TILE + TILE / 2;
}

export function tileCenterY(tileY) {
  return PLAY_TOP + tileY * TILE + TILE / 2;
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes + ":" + String(rest).padStart(2, "0");
}
