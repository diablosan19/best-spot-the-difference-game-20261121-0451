// The seven planted differences of the night market scene.
// Every entry names the spot (panel-local x/y, in the 580x500 panel space),
// the click radius, and a short label shown on the win screen.
export const TOTAL_DIFFS = 7;

export const DIFFS = [
  { id: 'lantern', x: 296, y: 96, r: 30, label: 'The middle lantern changed colour' },
  { id: 'cat', x: 472, y: 230, r: 30, label: 'The cat on the fruit stall vanished' },
  { id: 'sign', x: 150, y: 249, r: 30, label: 'The stall sign lost a letter' },
  { id: 'orange', x: 430, y: 372, r: 28, label: 'One orange went missing' },
  { id: 'hat', x: 150, y: 300, r: 30, label: 'The vendor lost his straw hat' },
  { id: 'bulb', x: 380, y: 72, r: 26, label: 'A string-light bulb went dark' },
  { id: 'steam', x: 96, y: 330, r: 30, label: 'The steamer stopped steaming' },
];

// Look up a difference by the point the player clicked (panel-local coords).
// Returns the diff object, or null when the click lands on nothing planted.
export function diffAt(px, py) {
  for (const d of DIFFS) {
    const dx = px - d.x;
    const dy = py - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}
