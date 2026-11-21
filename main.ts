// Lantern Night Market — the hand-in program (Node 22, standard library only).
//
// This repository is a plain static game: game/index.html plus its ES modules,
// playable offline from any static server, with 3 or 4 screenshots of the game
// itself in screenshots/. This program gathers those two folders and writes
// the dossier the judge reads, using the vendored make.fun library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Inside the grader the output directory is /output; outside it, the
// MAKEFUN_OUTPUT_DIR environment variable stands in for it.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer enforces: at most 4 screenshots of 256 KiB each, a game/
// of at most 993 files and directories and 48 MiB in all, paths under 1000
// bytes, and a dossier text of at most 160 KiB. Passing them here makes this
// program refuse an entry the scorer would refuse, instead of handing in
// something that cannot pass.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(destination, { recursive: true });
cpSync(join(repoRoot, 'game'), join(destination, 'game'), { recursive: true });

const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(destination, 'screenshots'), { recursive: true });
}

writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, dossierCaps));
