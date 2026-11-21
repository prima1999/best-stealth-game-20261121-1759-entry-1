// Whisper Gallery — game loop and state machine.
// One job: own the frame, the states, and the wiring between the other files.

import { CANVAS_WIDTH, CANVAS_HEIGHT, GUARD_DEFS, RELIC_TOTAL, DETECTION_CAUGHT_AT } from "./config.js";
import { makeRandom } from "./random.js";
import { buildLevel, allRelicsTaken, pointInRect } from "./world.js";
import { createGuards, updateGuards } from "./guards.js";
import { createPlayer, updatePlayer } from "./player.js";
import { createInput, consumeClick } from "./input.js";
import {
  createSoundBank,
  resumeAudio,
  playPickup,
  playAlert,
  playChase,
  playStep,
  playWin,
  playLose,
  playUnlock,
} from "./audio.js";
import { drawHud, drawWorld, drawTitle, drawEnd, drawPaused } from "./render.js";
import { readShotParams, applyShotStaging } from "./shots.js";

export function createGame(canvas) {
  const params = readShotParams();
  const random = makeRandom(params.seed);
  const seedOffset = Math.floor(random() * GUARD_DEFS.length);
  const level = buildLevel(params.seed);
  const player = createPlayer(level.playerStart.x, level.playerStart.y);
  const guards = createGuards(GUARD_DEFS, seedOffset);
  const input = createInput(canvas);
  const sound = createSoundBank();
  const game = {
    canvas,
    ctx: canvas.getContext("2d"),
    level,
    player,
    guards,
    input,
    sound,
    state: "title",
    elapsed: 0,
    timeNow: 0,
    lastFrame: 0,
    message: "",
    messageUntil: 0,
    shot: params.shot,
    seed: params.seed,
  };
  applyShotStaging(game, params.shot);
  return game;
}

export function resetGame(game) {
  const level = buildLevel(game.seed);
  const random = makeRandom(game.seed);
  const seedOffset = Math.floor(random() * GUARD_DEFS.length);
  game.level = level;
  game.player = createPlayer(level.playerStart.x, level.playerStart.y);
  game.guards = createGuards(GUARD_DEFS, seedOffset);
  game.state = "playing";
  game.elapsed = 0;
  game.message = "Steal all three relics, then reach the green exit.";
  game.messageUntil = game.timeNow + 5;
}

export function handleEvents(game, events) {
  for (const event of events) {
    if (event.type === "relic") {
      playPickup(game.sound);
      game.message = "Pocketed the " + event.name + " — " + event.count + " of " + event.total + " relics.";
      game.messageUntil = game.timeNow + 4;
      if (event.count === RELIC_TOTAL) {
        playUnlock(game.sound);
        game.message = "All relics pocketed — the exit is open. Go!";
        game.messageUntil = game.timeNow + 5;
      }
    } else if (event.type === "suspicious") {
      playAlert(game.sound);
      game.player.alerts += 1;
      game.message = "Guard " + event.guard + " is suspicious — hide!";
      game.messageUntil = game.timeNow + 3;
    } else if (event.type === "heard") {
      playAlert(game.sound);
      game.player.alerts += 1;
      game.message = "Guard " + event.guard + " heard your sprinting!";
      game.messageUntil = game.timeNow + 3;
    } else if (event.type === "chase") {
      playChase(game.sound);
      game.message = "Guard " + event.guard + " is chasing you — break line of sight!";
      game.messageUntil = game.timeNow + 3;
    } else if (event.type === "step") {
      playStep(game.sound, event.loud);
    }
  }
}

export function handleClick(game) {
  const click = consumeClick(game.input);
  if (!click) {
    return;
  }
  resumeAudio(game.sound);
  if (game.state === "title") {
    const inStart = click.x >= CANVAS_WIDTH / 2 - 130 && click.x <= CANVAS_WIDTH / 2 + 130 && click.y >= 460 && click.y <= 516;
    if (inStart) {
      resetGame(game);
    }
    return;
  }
  if (game.state === "won" || game.state === "caught") {
    const inAgain = click.x >= CANVAS_WIDTH / 2 - 130 && click.x <= CANVAS_WIDTH / 2 + 130 && click.y >= 448 && click.y <= 504;
    if (inAgain) {
      resetGame(game);
    }
    return;
  }
  if (game.state === "playing" && click.y > 64) {
    game.player.clickTarget = { x: click.x, y: click.y };
  }
}

export function updateGame(game, dt) {
  game.timeNow += dt;
  handleClick(game);
  const pressedEnter = game.input.wasPressed("Enter");
  const pressedR = game.input.wasPressed("KeyR");
  const pressedPause = game.input.wasPressed("KeyP") || game.input.wasPressed("Escape");
  game.input.clearPressed();
  if (game.state === "title" && pressedEnter) {
    resumeAudio(game.sound);
    resetGame(game);
    return;
  }
  if ((game.state === "won" || game.state === "caught") && pressedR) {
    resetGame(game);
    return;
  }
  if (game.state === "paused" && pressedPause) {
    game.state = "playing";
    return;
  }
  if (game.state === "playing" && pressedPause) {
    game.state = "paused";
    return;
  }
  if (game.state !== "playing") {
    return;
  }
  game.elapsed += dt;
  const events = [];
  updatePlayer(game.level, game.player, game.input, dt, game.timeNow, events);
  updateGuards(game.level, game.guards, game.player, dt, events);
  handleEvents(game, events);
  if (game.player.detection >= DETECTION_CAUGHT_AT) {
    game.state = "caught";
    playLose(game.sound);
    return;
  }
  if (allRelicsTaken(game.level) && pointInRect(game.player.x, game.player.y, game.level.exit)) {
    game.state = "won";
    playWin(game.sound);
  }
}

export function renderGame(game) {
  const ctx = game.ctx;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (game.state === "title") {
    drawTitle(ctx, game.level, game.guards, game.player, game.timeNow);
    drawHud(ctx, game.level, game.guards, game.player, game.elapsed, "");
    return;
  }
  const message = game.timeNow < game.messageUntil ? game.message : "";
  drawWorld(ctx, game.level, game.guards, game.player, game.timeNow);
  drawHud(ctx, game.level, game.guards, game.player, game.elapsed, message);
  if (game.state === "won") {
    drawEnd(ctx, true, game.elapsed, game.player.alerts, game.player.relics);
  } else if (game.state === "caught") {
    drawEnd(ctx, false, game.elapsed, game.player.alerts, game.player.relics);
  } else if (game.state === "paused") {
    drawPaused(ctx);
  }
}

export function startGame() {
  const canvas = document.getElementById("game");
  const game = createGame(canvas);
  window.__whisperGallery = game;
  function frame(timestamp) {
    const dt = Math.min(0.05, (timestamp - game.lastFrame) / 1000 || 0.016);
    game.lastFrame = timestamp;
    updateGame(game, dt);
    renderGame(game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

startGame();
