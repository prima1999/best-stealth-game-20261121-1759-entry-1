// Whisper Gallery — the hand-in program for the make.fun stealth bounty.
// It gathers the playable game and its screenshots into the output folder
// and asks the vendored dossier library to describe them for the judge.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = resolve(import.meta.dirname);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
const gameSource = join(repoRoot, "game");
const shotsSource = join(repoRoot, "screenshots");

function requireFolder(path, label) {
  if (!existsSync(path)) {
    throw new Error("Whisper Gallery hand-in: missing " + label + " folder at " + path);
  }
}

requireFolder(gameSource, "game");
requireFolder(shotsSource, "screenshots");

mkdirSync(join(outputDir, "game"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });

cpSync(gameSource, join(outputDir, "game"), { recursive: true });
cpSync(shotsSource, join(outputDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("Whisper Gallery: wrote " + outputDir + " with dossier.json (" + dossier.length + " bytes).");
