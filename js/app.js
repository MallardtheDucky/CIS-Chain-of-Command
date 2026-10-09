// app.js: page behaviour. Builds the tabs and rank table, opens the dossier popup, runs the clock.
// State: which tab is open.
let currentTab = 'fleet';
let currentView = 'table';
const ACTIVE = 'background:#0f3a73;color:#fff;border-color:#4aa8ff;box-shadow:0 0 14px rgba(74,168,255,0.35),inset 0 0 8px rgba(74,168,255,0.1);';
const IDLE = 'background:#2d333b;color:#768390;border-color:transparent;box-shadow:none;';

// buildTabs: creates one button per entry in TABS.
function buildTabs() {
  const bar = document.getElementById('tab-bar');
  const cls = 'tab-btn px-4 py-2 font-bold uppercase text-xs border-2 transition-all';
  bar.innerHTML = Object.keys(TABS).map(k => `<button onclick="setTab('${k}')" id="tab-${k}" class="${cls}">${TABS[k].label}</button>`).join('');
  paintTabs();
}
// paintTabs: highlights the active tab.
function paintTabs() {
  Object.keys(TABS).forEach(k => { document.getElementById('tab-' + k).style.cssText = currentView === 'table' && k === currentTab ? ACTIVE : IDLE; });
}
// setTab: switches tab and redraws the table.
function setTab(tab) {
  currentTab = tab;
  showView('table');
}
// showView: shows the table (kept as a function so more views can be added later).
function showView(v) {
  currentView = v;
  const panel = document.getElementById('view-panel');
  document.getElementById('table-view').classList.toggle('hidden', v !== 'table');
  panel.classList.toggle('hidden', v === 'table');
  paintTabs();
  if (v === 'table') render();
}

// visibleRows: tiers that at least one branch in the tab actually uses.
function visibleRows(tab) {
  return ['SUPREME'].concat(TIERS.filter((t, i) => tab.cols.some(k => BRANCHES[k].ranks[i] !== '-')));
}

// render: draws the table headers and rows for the current tab and updates the record count.
function render() {
  const tab = TABS[currentTab], body = document.getElementById('rank-table-body'), headerRow = document.getElementById('table-headers');
  const colCount = tab.cols.length + 1, rows = visibleRows(tab);
  headerRow.innerHTML = '<th class="p-4 border-r-2 border-imperial-grey/50 w-24">Tier</th>' + tab.cols.map(k =>
    `<th tabindex="0" role="button" title="Open branch record" onclick="openBranch('${k}')" onkeydown="if(event.key==='Enter')openBranch('${k}')" class="branch-th p-4 border-r-2 border-imperial-grey/50">${BRANCHES[k].label}</th>`).join('');
  document.querySelector('table').style.minWidth = `max(100%, ${110 + tab.cols.length * 190}px)`;
  body.innerHTML = '';
  let total = 1;
  const sep = txt => { const tr = document.createElement('tr'); tr.className = 'tier-group-row'; const td = document.createElement('td'); td.colSpan = colCount; td.textContent = '⬥  ' + txt; tr.appendChild(td); body.appendChild(tr); };
  rows.forEach(tier => {
    if (tier === 'SUPREME') {
      sep('SUPREME AUTHORITY // OFFICE OF THE SUPREME COMMANDER');
      const tr = document.createElement('tr'); tr.className = 'border-b border-imperial-grey/20 hover:bg-white/5 transition-all group';
      tr.innerHTML = `<td class="bg-black/60 text-imperial-red font-bold p-4 text-center">FO-6</td><td colspan="${colCount - 1}" class="p-0"><div tabindex="0" role="button" onclick="openSupreme()" onkeydown="if(event.key==='Enter')openSupreme()" class="p-4 w-full cell-hover text-gray-300 font-medium group-hover:text-white" style="letter-spacing:.12em;text-transform:uppercase;">Supreme Commander</div></td>`;
      body.appendChild(tr); return;
    }
    if (TIER_GROUPS[tier]) sep(TIER_GROUPS[tier]);
    const tr = document.createElement('tr'); tr.className = 'border-b border-imperial-grey/20 hover:bg-white/5 transition-all group';
    const th = document.createElement('td');
    th.className = 'bg-black/60 text-imperial-red font-bold p-4 text-center border-l-2 border-transparent group-hover:border-imperial-red transition-all'; th.innerText = tier; tr.appendChild(th);
    tab.cols.forEach(k => {
      const r = BRANCHES[k].ranks[TIERS.indexOf(tier)], td = document.createElement('td'); td.className = 'p-0 border-r border-imperial-grey/20';
      if (r !== '-') {
        const lat = BRANCHES[k].lateral && BRANCHES[k].lateral.tier === tier ? BRANCHES[k].lateral : null;
        td.innerHTML = `<div tabindex="0" role="button" onclick="openRank('${k}','${tier}')" onkeydown="if(event.key==='Enter')openRank('${k}','${tier}')" class="p-4 w-full h-full cell-hover text-gray-300 font-medium group-hover:text-white transition-colors">${r}</div>`
          + (lat ? `<div tabindex="0" role="button" title="Lateral post: stands beside ${r}, not above or below" onclick="openLateral('${k}')" onkeydown="if(event.key==='Enter')openLateral('${k}')" class="p-4 w-full cell-hover text-gray-300 font-medium group-hover:text-white transition-colors" style="border-top:1px dashed rgba(74,168,255,.35);">${lat.rank} <span style="font-size:9px;letter-spacing:.15em;color:#768390;">// LATERAL</span></div>` : '');
        if (lat) total++;
        total++;
      } else td.innerHTML = '<div class="p-4 text-imperial-grey opacity-20 select-none">---</div>';
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
  const rc = document.getElementById('record-count'); if (rc) rc.textContent = total;
}

// fillModal: fills in and opens the dossier popup.
function fillModal(o) {
  document.getElementById('modal-rank').innerText = o.rank;
  document.getElementById('modal-branch').innerText = o.branch;
  document.getElementById('modal-tier-label').innerText = o.tierLabel || 'Paygrade Tier';
  document.getElementById('modal-tier').innerText = o.tier;
  document.getElementById('modal-address').innerText = o.address;
  document.getElementById('modal-desc').innerText = o.desc;
  document.getElementById('modal-plaque-area').innerHTML = o.plaque;
  document.getElementById('modal-access').innerText = o.access;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-desc').parentElement.scrollTop = 0;
  updateClock();
}
// openRank / openBranch / openSupreme: open the popup for a rank cell, a branch header or the Supreme Commander row.
function openRank(key, tier) {
  const b = BRANCHES[key], g = grpOf(tier);
  fillModal({ rank: b.ranks[TIERS.indexOf(tier)], branch: b.name, tier, address: addressFor(key, tier), desc: describeRank(key, tier),
    plaque: createInsignia(tier, key), access: (key === 'veil' || key === 'vigil') ? 'LVL-6 SEALED' : (g === 'FO' ? 'LVL-5 RESTRICTED' : 'LVL-4 RESTRICTED') });
}
function openLateral(key) {
  const b = BRANCHES[key], L = b.lateral;
  fillModal({ rank: L.rank, branch: b.name, tierLabel: 'Tier (Lateral)', tier: L.tier, address: addressFor(key, L.tier).replace(b.ranks[TIERS.indexOf(L.tier)], L.rank), desc: describeLateral(key),
    plaque: createInsignia('LATERAL', key), access: 'LVL-6 SEALED' });
}
function openBranch(key) {
  const b = BRANCHES[key], held = b.ranks.filter(r => r !== '-');
  fillModal({ rank: b.name, branch: 'Branch Record', tierLabel: 'Ranks Held', tier: String(held.length), address: held[0] + ' to ' + held[held.length - 1],
    desc: describeBranch(key), plaque: createInsignia('EMBLEM', key), access: (key === 'veil' || key === 'vigil') ? 'LVL-6 SEALED' : 'LVL-4 RESTRICTED' });
}
function openSupreme() {
  fillModal({ rank: 'Supreme Commander', branch: 'Office of the Supreme Commander', tier: 'FO-6', address: 'Supreme Commander, Sir',
    desc: SUPREME_TEXT, plaque: createInsignia('SUPREME', 'navy'), access: 'LVL-7 SEALED' });
}
// closeModal: hides the popup (also bound to the Escape key below).
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// updateClock: updates the header clock, stardate and popup timestamp.
function updateClock() {
  const now = new Date(), p = n => String(n).padStart(2, '0'), t = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  const sd = ((now.getTime() - new Date('1977-05-25').getTime()) / 86400000 / 365.25 * 100 + 9900).toFixed(1);
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('clock-display', t); set('stardate-display', 'SD: ' + sd); set('modal-timestamp', t);
}
setInterval(updateClock, 1000);
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.addEventListener('load', () => { buildTabs(); render(); updateClock(); });
