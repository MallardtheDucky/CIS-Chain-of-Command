// insignia.js: builds the triangle-strip rank insignia (SVG) shown in the dossier popup.
// Strip colours used by the insignia.
const BAR = { red:'#8c1118', gold:'#f5c518', cyan:'#38d6ff' };
const SILVER = '#cfd5df';
const U = (c, len, from) => [c, from || 0, len];

// OFFICER_TIERS / OFF: strip patterns for officer tiers, per branch family.
const OFFICER_TIERS = ['FO-5','FO-4','FO-3','FO-2','FO-1','SO-3','SO-2','SO-1','JO-4','JO-3','JO-2','JO-1','MID-1'];
const OFF = {
  fleet: [
    {n:6,first:'up',o:U('gold',6),u:U('red',6)},{n:6,first:'up',u:U('red',5)},{n:6,first:'up',u:U('red',3)},
    {n:5,first:'up',u:U('red',3)},{n:5,first:'up',u:U('red',5)},
    {n:4,first:'up',u:U('red',4)},{n:4,first:'down',u:U('red',2)},{n:4,first:'up',u:U('red',2)},
    {n:3,first:'up',u:U('red',2)},{n:3,first:'up',u:U('red',1)},{n:3,first:'up'},{n:2,first:'up'},{n:1,first:'up'}],
  ground: [
    {n:6,first:'down',o:U('gold',6),u:U('gold',6)},{n:6,first:'down',u:U('gold',3,3)},{n:6,first:'down',u:U('gold',2,4)},
    {n:6,first:'down'},{n:5,first:'down',u:U('gold',2,2)},
    {n:5,first:'down'},{n:5,first:'down',u:U('gold',2,3)},{n:4,first:'down'},
    {n:4,first:'down',s:1.12},{n:3,first:'down',u:U('gold',1)},{n:3,first:'down'},{n:2,first:'down'},{n:1,first:'down'}],
  intel: [
    {n:6,first:'down',o:U('gold',6),u:U('red',6),hex:true},{n:6,first:'down',o:U('gold',6),u:U('red',6)},{n:6,first:'down',u:U('red',6)},
    {n:6,first:'down'},{n:5,first:'down'},
    {n:4,first:'up'},{n:4,first:'down'},{n:3,first:'down'},
    {n:3,first:'down',s:1.15,o:U('gold',1)},{n:2,first:'down',o:U('gold',1),u:U('red',1,1)},{n:2,first:'down'},{n:2,first:'down',s:.8},{n:1,first:'down'}],
  civil: [
    {n:6,first:'up',u:U('gold',6),hex:true},{n:5,first:'up',u:U('gold',5),hex:true},{n:6,first:'up'},
    {n:5,first:'up',u:U('gold',5)},{n:5,first:'up'},
    {n:4,first:'up',u:U('gold',4)},{n:4,first:'up'},{n:3,first:'up',u:U('gold',3)},
    {n:3,first:'up'},{n:2,first:'up',u:U('gold',2)},{n:2,first:'up'},{n:2,first:'up',s:.8},{n:1,first:'up'}]
};
// recolor: copies a pattern list with its colours swapped.
const recolor = (list, map) => list.map(sp => { const c = { ...sp }; ['u','o'].forEach(k => { if (c[k]) c[k] = [map[c[k][0]] || c[k][0], c[k][1], c[k][2]]; }); return c; });
OFF.veil = OFF.intel;
OFF.vigil = recolor(OFF.ground, { gold:'red' });
OFF.police = OFF.ground;
OFF.support = recolor(OFF.fleet, { red:'gold' });
OFF.droid = recolor(OFF.fleet, { red:'cyan', gold:'cyan' });

// HOLLOW / LOWBAR: accent colours per family for outlined strips and the lower-rank bar.
const HOLLOW = { fleet:'#f5b800', ground:'#d04a3a', intel:'#7f8cff', civil:'#dfe9f6', veil:'#8d96a8', support:'#e8832a', droid:'#38d6ff', police:'#8fb8ff', vigil:'#d9ceb6' };
const LOWBAR = { fleet:'red', intel:'red', ground:'gold', civil:'gold', veil:'gold', support:'gold', droid:'cyan', police:'gold', vigil:'red' };

// specFor: picks the strip pattern for a tier and family.
function specFor(tier, fam) {
  const oi = OFFICER_TIERS.indexOf(tier);
  if (oi >= 0) return OFF[fam][oi];
  const c = LOWBAR[fam], m = { mark: SILVER, first: 'up' }, h = { hollow: true, first: 'up', mark: HOLLOW[fam] };
  const t = {
    'WO-4':{...h,n:4}, 'WO-3':{...h,n:3}, 'WO-2':{...h,n:2}, 'WO-1':{...h,n:1},
    'SNCO-3A':{...m,n:5,u:U(c,5)}, 'SNCO-3':{...m,n:4,u:U(c,4)}, 'SNCO-2A':{...m,n:4},
    'SNCO-2':{...m,n:3,u:U(c,3)}, 'SNCO-1':{...m,n:3},
    'JNCO-3':{...m,n:2,u:U(c,2)}, 'JNCO-2':{...m,n:2}, 'JNCO-1':{...m,n:1},
    'E-3':{...m,n:1,s:.7,u:U(c,1)}, 'E-2':{...m,n:1,s:.7,hollow:true}
  };
  return t[tier] || null;
}

// hexPts: corner points of a hexagon (used for the Confederate emblem).
function hexPts(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
  return p;
}
// emblemGroup: draws the hexagon emblem at a given centre and radius.
function emblemGroup(cx, cy, r) {
  const v = hexPts(cx, cy, r), core = hexPts(cx, cy, r * .3).join(' '), sw = Math.max(1.5, r * .07);
  let g = `<g stroke="#151a70" stroke-width="${sw}" stroke-linejoin="round"><polygon points="${v.join(' ')}" fill="none" stroke-width="${sw * 2}"/>`;
  for (let i = 0; i < 6; i++) g += `<polygon points="${cx},${cy} ${v[i]} ${v[(i + 1) % 6]}" fill="#fff"/>`;
  return g + `<polygon points="${core}" fill="#151a70"/></g>`;
}
// vigilEmblem: the Brotherhood's own mark, a pale hexagon holding a slit-pupil eye.
function vigilEmblem(cx, cy, r) {
  const v = hexPts(cx, cy, r).join(' '), sw = Math.max(1.5, r * .07), ew = r * .62, eh = r * .3;
  return `<g stroke-linejoin="round"><polygon points="${v}" fill="#0c0709" stroke="#d9ceb6" stroke-width="${sw * 1.6}"/>`
    + `<path d="M${cx - ew},${cy} Q${cx},${cy - eh * 2} ${cx + ew},${cy} Q${cx},${cy + eh * 2} ${cx - ew},${cy} Z" fill="none" stroke="#d9ceb6" stroke-width="${sw}"/>`
    + `<ellipse cx="${cx}" cy="${cy}" rx="${r * .09}" ry="${eh * 1.05}" fill="#8c1118"/></g>`;
}
// strip: draws a row of alternating triangles.
function strip(n, first, x0, y0, W, H, fill, gap, hollow) {
  const hw = W / 2; let out = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + i * hw, up = (first === 'up') === (i % 2 === 0);
    const pts = up ? `${x},${y0 + H} ${x + W},${y0 + H} ${x + hw},${y0}` : `${x},${y0} ${x + W},${y0} ${x + hw},${y0 + H}`;
    out += hollow
      ? `<polygon points="${pts}" fill="none" stroke="${fill}" stroke-width="3.5" stroke-linejoin="round"/>`
      : `<polygon points="${pts}" fill="${fill}" stroke="${gap}" stroke-width="3" stroke-linejoin="miter"/>`;
  }
  return out;
}
// insigniaSVG: assembles a full insignia from a spec and palette.
function insigniaSVG(spec, pal) {
  const VW = 300, VH = 84; let body = '';
  if (spec.supreme) {
    const W = 44, H = 35, hw = W / 2, sw = 7 * hw, r = 35, total = sw + 14 + r * 2, x0 = (VW - total) / 2, y0 = (VH - H * 2) / 2;
    body += strip(6, 'up', x0, y0, W, H, '#f5b800', pal.bg) + strip(6, 'down', x0, y0 + H, W, H, '#b3121a', pal.bg) + emblemGroup(x0 + sw + 14 + r, VH / 2, r);
  } else if (spec.emblem) {
    body += spec.vigil ? vigilEmblem(VW / 2, VH / 2, 36) : emblemGroup(VW / 2, VH / 2, 36);
  } else {
    const s = spec.s || 1, W = 56 * s, H = 48 * s, hw = W / 2, stripW = (spec.n + 1) * hw, hexR = 20, extra = spec.hex ? hexR * 2 + 12 : 0;
    const x0 = (VW - stripW - extra) / 2, y0 = (VH - H) / 2;
    body += strip(spec.n, spec.first, x0, y0, W, H, spec.mark || pal.mark, pal.bg, spec.hollow);
    const bar = (b, y) => `<rect x="${x0 + b[1] * hw}" y="${y}" width="${(b[2] + 1) * hw}" height="4" fill="${BAR[b[0]]}"/>`;
    if (spec.u) body += bar(spec.u, y0 + H + 6);
    if (spec.o) body += bar(spec.o, y0 - 10);
    if (spec.hex) body += spec.vigil ? vigilEmblem(x0 + stripW + 12 + hexR, VH / 2, hexR) : emblemGroup(x0 + stripW + 12 + hexR, VH / 2, hexR);
  }
  return `<svg viewBox="0 0 ${VW} ${VH}" width="100%" aria-hidden="true">${body}</svg>`;
}
// plate: wraps an insignia in its coloured backing plate.
const plate = (svg, bg) => `<div style="width:270px;background:${bg};border-radius:3px;padding:6px 4px;">${svg}</div>`;

// createInsignia: public entry point. Returns the insignia HTML for a tier and branch ("EMBLEM" and "SUPREME" are special cases).
function createInsignia(tier, branchKey) {
  if (tier === 'SUPREME') return plate(insigniaSVG({ supreme: true }, { bg: '#0f1d4d' }), '#0f1d4d');
  const fam = FAMILIES[BRANCHES[branchKey].fam];
  const isV = BRANCHES[branchKey].fam === 'vigil';
  if (tier === 'EMBLEM') return plate(insigniaSVG({ emblem: true, vigil: isV }, fam), fam.bg);
  const realTier = tier === 'LATERAL' ? BRANCHES[branchKey].lateral.tier : tier;
  let spec = specFor(realTier, BRANCHES[branchKey].fam);
  if (!spec && isV) return plate(insigniaSVG({ emblem: true, vigil: true }, fam), fam.bg);
  if (!spec) return `<div class="text-[10px] text-gray-500 italic" style="max-width:220px;">${BRANCHES[branchKey].noInsignia || 'No Insignia Authorized. Recruits wear a plain unit patch only.'}</div>`;
  if (isV) spec = { ...spec, hex: true, vigil: true };
  return plate(insigniaSVG(spec, fam), fam.bg);
}
