// Lantern Night Market — spot the difference.
// One canvas holds both panels: the left picture is variant A, the right one
// variant B. Clicking a planted difference in either panel rings it in both.
// Keyboard: arrows move the crosshair, Enter marks, H hints, R restarts.

import { drawMarket, PANEL_W, PANEL_H } from './scene.js';
import { DIFFS, TOTAL_DIFFS, diffAt } from './diffs.js';
import { playFound, playWrong, playWin, playHint } from './sound.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');

const VIEW_W = 1240;
const VIEW_H = 640;
const LEFT_X = 20;
const RIGHT_X = 640;
const PANEL_Y = 56;
const ROUND_SECONDS = 180;
const HINTS_TOTAL = 3;
const WRONG_PENALTY = 5;

canvas.width = VIEW_W;
canvas.height = VIEW_H;

// Shot presets from the URL, used by the screenshot run: ?shot=start|mid|late|win
// pre-marks that many differences and freezes the timer so the frame is stable.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const SHOT_FOUND = { start: 0, mid: 3, late: 6, win: TOTAL_DIFFS }[shot] ?? null;

const state = {
  found: new Set(),
  wrong: [], // {x, y, panel, until} — fading red X marks
  hintsLeft: HINTS_TOTAL,
  hinted: null, // {diff, until} — pulsing ring around a clue
  secondsLeft: ROUND_SECONDS,
  over: false,
  won: false,
  cursor: { x: LEFT_X + PANEL_W / 2, y: PANEL_Y + PANEL_H / 2 },
  cursorPanel: 'left',
  started: false,
};

function panelOf(px) {
  if (px >= LEFT_X && px < LEFT_X + PANEL_W) return { origin: LEFT_X, variant: 'A' };
  if (px >= RIGHT_X && px < RIGHT_X + PANEL_W) return { origin: RIGHT_X, variant: 'B' };
  return null;
}

function toCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (VIEW_W / rect.width),
    y: (event.clientY - rect.top) * (VIEW_H / rect.height),
  };
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function markFound(diff) {
  state.found.add(diff.id);
  playFound();
  if (state.found.size === TOTAL_DIFFS) {
    state.won = true;
    state.over = true;
    playWin();
  }
  announce();
}

function markWrong(x, y) {
  state.wrong.push({ x, y, until: performance.now() + 700 });
  state.secondsLeft = Math.max(0, state.secondsLeft - WRONG_PENALTY);
  playWrong();
  if (state.secondsLeft === 0) {
    state.over = true;
  }
  announce();
}

function announce() {
  const left = TOTAL_DIFFS - state.found.size;
  statusEl.textContent = state.over
    ? state.won
      ? `You found all ${TOTAL_DIFFS} differences!`
      : 'Time ran out.'
    : `${left} difference${left === 1 ? '' : 's'} left to find.`;
}

function useHint() {
  if (state.over || state.hintsLeft <= 0) return;
  const remaining = DIFFS.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  state.hinted = { diff: remaining[Math.floor(Math.random() * remaining.length)], until: performance.now() + 1400 };
  playHint();
}

function restart() {
  state.found.clear();
  state.wrong = [];
  state.hintsLeft = HINTS_TOTAL;
  state.hinted = null;
  state.secondsLeft = ROUND_SECONDS;
  state.over = false;
  state.won = false;
  state.started = false;
  announce();
}

function handleMark(px, py) {
  if (state.over) return;
  const panel = panelOf(px);
  if (panel === null) return;
  const local = { x: px - panel.origin, y: py - PANEL_Y };
  if (local.y < 0 || local.y > PANEL_H) return;
  const diff = diffAt(local.x, local.y);
  if (diff === null) {
    markWrong(px, py);
    return;
  }
  if (state.found.has(diff.id)) return;
  markFound(diff);
}

canvas.addEventListener('pointerdown', (event) => {
  const p = toCanvasPoint(event);
  state.cursor = p;
  state.cursorPanel = p.x < VIEW_W / 2 ? 'left' : 'right';
  handleMark(p.x, p.y);
});

canvas.addEventListener('pointermove', (event) => {
  const p = toCanvasPoint(event);
  state.cursor = p;
  state.cursorPanel = p.x < VIEW_W / 2 ? 'left' : 'right';
});

hintBtn.addEventListener('click', useHint);
restartBtn.addEventListener('click', restart);

document.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === 'R') {
    restart();
    return;
  }
  if (state.over) return;
  const step = event.shiftKey ? 4 : 14;
  const c = state.cursor;
  if (event.key === 'ArrowLeft') { c.x = Math.max(4, c.x - step); event.preventDefault(); }
  else if (event.key === 'ArrowRight') { c.x = Math.min(VIEW_W - 4, c.x + step); event.preventDefault(); }
  else if (event.key === 'ArrowUp') { c.y = Math.max(4, c.y - step); event.preventDefault(); }
  else if (event.key === 'ArrowDown') { c.y = Math.min(VIEW_H - 4, c.y + step); event.preventDefault(); }
  else if (event.key === 'Enter' || event.key === ' ') {
    handleMark(c.x, c.y);
    event.preventDefault();
  } else if (event.key === 'h' || event.key === 'H') {
    useHint();
  }
});

function drawRing(x, y, r, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFoundMarks() {
  for (const diff of DIFFS) {
    if (!state.found.has(diff.id)) continue;
    for (const origin of [LEFT_X, RIGHT_X]) {
      const cx = origin + diff.x;
      const cy = PANEL_Y + diff.y;
      drawRing(cx, cy, diff.r + 6, '#ffd23f', 4);
      drawRing(cx, cy, diff.r + 11, 'rgba(255,210,63,0.45)', 2);
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy);
      ctx.lineTo(cx - 2, cy + 8);
      ctx.lineTo(cx + 11, cy - 8);
      ctx.stroke();
    }
  }
}

function drawWrongMarks(now) {
  state.wrong = state.wrong.filter((w) => w.until > now);
  for (const w of state.wrong) {
    const fade = (w.until - now) / 700;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.strokeStyle = '#ff5a4e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w.x - 10, w.y - 10);
    ctx.lineTo(w.x + 10, w.y + 10);
    ctx.moveTo(w.x + 10, w.y - 10);
    ctx.lineTo(w.x - 10, w.y + 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawHint(now) {
  if (state.hinted === null) return;
  if (state.hinted.until <= now) {
    state.hinted = null;
    return;
  }
  const pulse = 1 + 0.12 * Math.sin(now / 130);
  const d = state.hinted.diff;
  for (const origin of [LEFT_X, RIGHT_X]) {
    drawRing(origin + d.x, PANEL_Y + d.y, (d.r + 8) * pulse, 'rgba(255,210,63,0.9)', 3);
  }
}

function drawCursor() {
  if (state.over) return;
  const c = state.cursor;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.x - 14, c.y);
  ctx.lineTo(c.x + 14, c.y);
  ctx.moveTo(c.x, c.y - 14);
  ctx.lineTo(c.x, c.y + 14);
  ctx.stroke();
  drawRing(c.x, c.y, 9, 'rgba(255,255,255,0.9)', 2);
}

function drawHeader() {
  ctx.fillStyle = '#120e26';
  ctx.fillRect(0, 0, VIEW_W, 48);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏮 Lantern Night Market', 20, 25);
  const left = TOTAL_DIFFS - state.found.size;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Found ${state.found.size} / ${TOTAL_DIFFS}  •  ${left} to go`, VIEW_W / 2, 25);
  const low = state.secondsLeft <= 30 && !state.over;
  ctx.fillStyle = low ? '#ff5a4e' : '#9fe8c0';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${fmtTime(state.secondsLeft)}`, VIEW_W - 20, 25);
  ctx.fillStyle = '#3a2f5e';
  ctx.fillRect(0, 48, VIEW_W, 2);
}

function drawFooter() {
  ctx.fillStyle = '#120e26';
  ctx.fillRect(0, VIEW_H - 32, VIEW_W, 32);
  ctx.fillStyle = '#b9aed6';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Click a difference in either picture  •  Arrows move the crosshair, Enter marks  •  H hint  •  R restart', VIEW_W / 2, VIEW_H - 15);
}

function drawPanels() {
  ctx.save();
  ctx.translate(LEFT_X, PANEL_Y);
  drawMarket(ctx, 'A');
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_X, PANEL_Y);
  drawMarket(ctx, 'B');
  ctx.restore();
  ctx.strokeStyle = '#4a3a72';
  ctx.lineWidth = 3;
  ctx.strokeRect(LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
  ctx.strokeRect(RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);
  ctx.fillStyle = '#120e26';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('A', LEFT_X + 10, PANEL_Y + 22);
  ctx.fillText('B', RIGHT_X + 10, PANEL_Y + 22);
}

function drawOverlay() {
  if (!state.over) return;
  ctx.fillStyle = 'rgba(10, 6, 24, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#1d1538';
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 3;
  const bw = 560;
  const bh = 300;
  const bx = (VIEW_W - bw) / 2;
  const by = (VIEW_H - bh) / 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(state.won ? '🎉 You found them all!' : "⏰ Time's up!", VIEW_W / 2, by + 62);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Georgia, serif';
  if (state.won) {
    const bonus = state.secondsLeft * 10;
    const score = TOTAL_DIFFS * 100 + bonus + state.hintsLeft * 50;
    ctx.fillText(`All ${TOTAL_DIFFS} differences found with ${fmtTime(state.secondsLeft)} to spare.`, VIEW_W / 2, by + 116);
    ctx.fillText(`Score: ${score}  (time bonus ${bonus} + hint bonus ${state.hintsLeft * 50})`, VIEW_W / 2, by + 150);
    ctx.fillStyle = '#b9aed6';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('The cat, the hat, the lantern, the bulb, the steam, the sign, the orange —', VIEW_W / 2, by + 190);
    ctx.fillText('every one of them was hiding in plain sight.', VIEW_W / 2, by + 214);
  } else {
    const missed = DIFFS.filter((d) => !state.found.has(d.id));
    ctx.fillText(`You found ${state.found.size} of ${TOTAL_DIFFS}. Still hiding:`, VIEW_W / 2, by + 116);
    ctx.fillStyle = '#b9aed6';
    ctx.font = '16px Georgia, serif';
    missed.forEach((d, i) => {
      ctx.fillText(`• ${d.label}`, VIEW_W / 2, by + 148 + i * 22);
    });
  }
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('Press R or click Restart to play again', VIEW_W / 2, by + bh - 28);
}

function frame(now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#120e26';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawHeader();
  drawPanels();
  drawFoundMarks();
  drawWrongMarks(now);
  drawHint(now);
  drawCursor();
  drawFooter();
  drawOverlay();
  requestAnimationFrame(frame);
}

// Test hook: lets automated play-tests read the live game state.
window.__game = { state, DIFFS, TOTAL_DIFFS };

// Shot presets: pre-mark differences and freeze the clock for screenshots.
if (SHOT_FOUND !== null) {
  DIFFS.slice(0, SHOT_FOUND).forEach((d) => state.found.add(d.id));
  if (SHOT_FOUND === TOTAL_DIFFS) {
    state.won = true;
    state.over = true;
  }
  state.secondsLeft = 147; // 2:27 on the clock, frozen for the shot
  announce();
  requestAnimationFrame(frame);
  // The screenshot runner waits for this flag.
  window.__shotReady = true;
} else {
  announce();
  requestAnimationFrame(frame);
  window.__shotReady = true;
  let lastTick = performance.now();
  setInterval(() => {
    if (state.over || !state.started) return;
    const now = performance.now();
    if (now - lastTick >= 1000) {
      lastTick = now;
      state.secondsLeft = Math.max(0, state.secondsLeft - 1);
      if (state.secondsLeft === 0) {
        state.over = true;
        announce();
      }
    }
  }, 200);
  // The clock starts on the first real interaction, not on load.
  canvas.addEventListener('pointerdown', () => { state.started = true; }, { once: true });
  document.addEventListener('keydown', () => { state.started = true; }, { once: true });
}
