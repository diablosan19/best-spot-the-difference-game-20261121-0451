// Tiny WebAudio bleeps, generated at run time — no sound files, no network.
// The context is created lazily on the first user gesture so browsers allow it.
let ctx = null;

function audio() {
  if (ctx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, startAt, length, kind, loud) {
  const ac = audio();
  if (ac === null) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = kind;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(loud, ac.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + length);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + length + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(659, 0, 0.14, 'sine', 0.16);
  tone(988, 0.09, 0.22, 'sine', 0.16);
}

// A dull low buzz for a wrong click.
export function playWrong() {
  tone(140, 0, 0.18, 'sawtooth', 0.07);
}

// A rising arpeggio for the win.
export function playWin() {
  tone(523, 0, 0.16, 'triangle', 0.15);
  tone(659, 0.12, 0.16, 'triangle', 0.15);
  tone(784, 0.24, 0.16, 'triangle', 0.15);
  tone(1047, 0.36, 0.4, 'triangle', 0.15);
}

// A soft tick when a hint is spent.
export function playHint() {
  tone(880, 0, 0.1, 'sine', 0.1);
  tone(1175, 0.08, 0.14, 'sine', 0.1);
}
