// drawMarket: paints one panel of the night market scene on a 2D context.
// `variant` is 'A' or 'B' — the two panels are identical except for the seven
// planted differences, which this function switches on the variant flag.
// Panel space is 580 wide by 500 tall; the caller translates the context to
// the panel's origin first.

export const PANEL_W = 580;
export const PANEL_H = 500;

// Deterministic star field, so both panels share exactly the same sky.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rnd = mulberry32(20261121);
  const list = [];
  for (let i = 0; i < 46; i++) {
    list.push({ x: 20 + rnd() * 540, y: 12 + rnd() * 150, r: 0.8 + rnd() * 1.6, a: 0.35 + rnd() * 0.6 });
  }
  return list;
})();

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, '#171233');
  sky.addColorStop(0.55, '#3a1f5d');
  sky.addColorStop(1, '#7c2d5c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 370);
  for (const s of STARS) {
    ctx.globalAlpha = s.a;
    ctx.fillStyle = '#fff6d8';
    circle(ctx, s.x, s.y, s.r);
  }
  ctx.globalAlpha = 1;
  // Moon, same in both panels.
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 470, 78, 30);
  ctx.fillStyle = '#f2cf7d';
  circle(ctx, 460, 70, 6);
  circle(ctx, 480, 86, 4);
  circle(ctx, 472, 92, 3);
}

function drawRooftops(ctx) {
  ctx.fillStyle = '#241a3e';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.lineTo(0, 300);
  ctx.lineTo(70, 300);
  ctx.lineTo(110, 268);
  ctx.lineTo(150, 300);
  ctx.lineTo(300, 300);
  ctx.lineTo(340, 272);
  ctx.lineTo(380, 300);
  ctx.lineTo(580, 300);
  ctx.lineTo(580, 330);
  ctx.closePath();
  ctx.fill();
  // Lit windows in the rooftops.
  ctx.fillStyle = '#ffd27a';
  const windows = [[48, 306, 10, 12], [96, 306, 10, 12], [318, 306, 10, 12], [500, 306, 10, 12], [540, 306, 10, 12]];
  for (const [x, y, w, h] of windows) ctx.fillRect(x, y, w, h);
  // Cobblestone ground.
  ctx.fillStyle = '#2c2140';
  ctx.fillRect(0, 330, PANEL_W, 170);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let y = 350; y < 500; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_W, y);
    ctx.stroke();
  }
  for (let x = 30; x < PANEL_W; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 330);
    ctx.lineTo(x - 14, 500);
    ctx.stroke();
  }
}

// The lantern string across the top, plus the bulb wire beneath it.
// Lantern 3 (x 296) is a difference: red in A, teal in B.
// Bulb 4 (x 380) is a difference: lit warm in A, dark in B.
function drawLanterns(ctx, variant) {
  ctx.strokeStyle = '#0f0b22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 52);
  ctx.quadraticCurveTo(290, 84, 560, 52);
  ctx.stroke();
  const spots = [80, 190, 296, 400, 505];
  spots.forEach((x, i) => {
    const y = 62 + Math.sin((i / 4) * Math.PI) * 26;
    ctx.strokeStyle = '#0f0b22';
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y);
    ctx.stroke();
    const isDiff = i === 2;
    ctx.fillStyle = isDiff ? (variant === 'A' ? '#e8452c' : '#2ca88f') : (i % 2 === 0 ? '#e8452c' : '#f2a541');
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x - 6, y + 7, 4, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98a2b';
    ctx.fillRect(x - 8, y - 8, 16, 5);
    ctx.fillRect(x - 8, y + 30, 16, 5);
    ctx.strokeStyle = '#f2a541';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 35);
    ctx.lineTo(x - 5, y + 44);
    ctx.moveTo(x + 5, y + 35);
    ctx.lineTo(x + 5, y + 44);
    ctx.stroke();
  });
  // Bulb wire.
  ctx.strokeStyle = '#0f0b22';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 46);
  ctx.quadraticCurveTo(290, 66, 520, 46);
  ctx.stroke();
  const bulbs = [120, 200, 280, 380, 460];
  bulbs.forEach((x, i) => {
    const y = 50 + Math.sin((i / 4) * Math.PI) * 12;
    const isDiff = i === 3;
    const lit = isDiff ? variant === 'A' : true;
    if (lit) {
      ctx.fillStyle = 'rgba(255, 214, 120, 0.25)';
      circle(ctx, x, y + 8, 14);
    }
    ctx.fillStyle = lit ? '#ffd678' : '#4a4458';
    circle(ctx, x, y + 8, 5);
  });
}

function drawFoodStall(ctx, variant) {
  // Awning, red and cream stripes.
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c93a2e' : '#f5e6c8';
    ctx.fillRect(44 + i * 36, 182, 36, 34);
  }
  ctx.fillStyle = '#8e2a22';
  ctx.fillRect(40, 214, 224, 6);
  // Hanging sign: "BAO" in A, "PAO" in B.
  ctx.fillStyle = '#f5e6c8';
  roundRect(ctx, 108, 232, 84, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#8e2a22';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#8e2a22';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(variant === 'A' ? 'BAO' : 'PAO', 150, 250);
  // Stall posts and counter.
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(44, 220, 8, 200);
  ctx.fillRect(252, 220, 8, 200);
  ctx.fillStyle = '#7a4a28';
  ctx.fillRect(40, 380, 224, 14);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(40, 394, 224, 34);
  // Steamer pot with dumplings, steam only in A.
  ctx.fillStyle = '#b8bcc4';
  ctx.beginPath();
  ctx.ellipse(96, 372, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8f959e';
  ctx.fillRect(62, 352, 68, 22);
  ctx.fillStyle = '#f5e6c8';
  const buns = [[78, 350], [96, 346], [114, 350]];
  for (const [bx, by] of buns) circle(ctx, bx, by, 8);
  if (variant === 'A') {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [sx, sy, sw] of [[84, 336, 6], [98, 330, 8], [110, 336, 6]]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + sw, sy - 10, sx - 2, sy - 18);
      ctx.stroke();
    }
  }
  // Vendor behind the counter. Straw hat in A, hair bun in B.
  ctx.fillStyle = '#3f6fb5';
  roundRect(ctx, 128, 330, 46, 52, 10);
  ctx.fill();
  ctx.fillStyle = '#e8b98a';
  circle(ctx, 151, 312, 16);
  ctx.fillStyle = '#2c2118';
  ctx.beginPath();
  ctx.arc(151, 306, 16, Math.PI, 0);
  ctx.fill();
  if (variant === 'A') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(151, 282);
    ctx.lineTo(120, 306);
    ctx.lineTo(182, 306);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a8762a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(132, 296);
    ctx.lineTo(170, 296);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2c2118';
    circle(ctx, 151, 292, 7);
  }
  // Bowls on the counter.
  ctx.fillStyle = '#2ca88f';
  circle(ctx, 200, 372, 12);
  ctx.fillStyle = '#e8452c';
  circle(ctx, 228, 372, 12);
}

function drawFruitStall(ctx, variant) {
  // Awning, green and cream stripes.
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2f7d4f' : '#f5e6c8';
    ctx.fillRect(324 + i * 36, 182, 36, 34);
  }
  ctx.fillStyle = '#1f5c38';
  ctx.fillRect(320, 214, 224, 6);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(324, 220, 8, 200);
  ctx.fillRect(532, 220, 8, 200);
  // Stall roof line where the cat sits.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(320, 236, 224, 10);
  // Cat on the roof, only in A.
  if (variant === 'A') {
    ctx.fillStyle = '#3a3a44';
    ctx.beginPath();
    ctx.ellipse(470, 232, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 492, 222, 10);
    ctx.beginPath();
    ctx.moveTo(486, 214);
    ctx.lineTo(484, 204);
    ctx.lineTo(491, 212);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(496, 213);
    ctx.lineTo(498, 203);
    ctx.lineTo(502, 212);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a3a44';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(446, 232);
    ctx.quadraticCurveTo(430, 228, 434, 212);
    ctx.stroke();
    ctx.fillStyle = '#ffd678';
    circle(ctx, 495, 220, 1.8);
  }
  // Counter and fruit baskets.
  ctx.fillStyle = '#7a4a28';
  ctx.fillRect(320, 380, 224, 14);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(320, 394, 224, 34);
  // Basket of oranges: 5 in A, 4 in B (top one missing).
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.moveTo(398, 372);
  ctx.lineTo(462, 372);
  ctx.lineTo(452, 392);
  ctx.lineTo(408, 392);
  ctx.closePath();
  ctx.fill();
  const oranges = variant === 'A'
    ? [[412, 362], [430, 356], [448, 362], [421, 368], [439, 368]]
    : [[412, 362], [448, 362], [421, 368], [439, 368]];
  ctx.fillStyle = '#f28c1e';
  for (const [ox, oy] of oranges) circle(ctx, ox, oy, 10);
  ctx.fillStyle = '#3f8f3f';
  for (const [ox, oy] of oranges) {
    ctx.beginPath();
    ctx.ellipse(ox + 3, oy - 9, 4, 2.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Basket of apples beside it.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.moveTo(478, 372);
  ctx.lineTo(530, 372);
  ctx.lineTo(522, 392);
  ctx.lineTo(486, 392);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d23b2e';
  for (const [ax, ay] of [[490, 362], [506, 356], [520, 362]]) circle(ctx, ax, ay, 9);
  // Paper lantern resting on the ground.
  ctx.fillStyle = '#e8452c';
  ctx.beginPath();
  ctx.ellipse(540, 448, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(534, 441, 4, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Crate with greens at the left edge.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(16, 440, 44, 30);
  ctx.fillStyle = '#4d8a3f';
  circle(ctx, 30, 436, 9);
  circle(ctx, 46, 436, 9);
}

export function drawMarket(ctx, variant) {
  drawSky(ctx);
  drawRooftops(ctx);
  drawFoodStall(ctx, variant);
  drawFruitStall(ctx, variant);
  drawLanterns(ctx, variant);
}
