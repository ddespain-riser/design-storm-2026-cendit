'use strict';
/* Snow to Foothills: team cendit's Scenario 3 prototype. Vanilla JS + SVG, no dependencies.
   Reads data/twin.json (build_data.py) and /api/live (server.py). */

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const DAY = 86400000;
const DECISION_H = 4;  // Jake, 2026-09-25: about 4 days is the window operators need to act

const LANES = [
  { key: 'swe', label: 'Snowpack · Hoosier Pass', unit: 'in SWE', color: '#cfe8ff', median: true },
  { key: 'prcp', label: 'Rain · NOAA USC00058022', unit: 'in / day', color: '#7fd1ff', bars: true },
  { key: 'flow', label: 'Flow · DWR PLASPLCO', unit: 'cfs', color: '#4fb3ff' },
  { key: 'turb', label: 'Turbidity · USGS 06707525', unit: 'FNU, median & max (log)', color: '#d9a866', extra: 'turbMax', extraColor: '#8a5a2b', log: true },
  { key: 'cond', label: 'Conductance · 06707525', unit: 'µS/cm', color: '#b48cff' },
  { key: 'cheStor', label: 'Cheesman storage', unit: 'acre-feet', color: '#5ad1c0' },
  { key: 'strStor', label: 'Strontia Springs storage', unit: 'acre-feet', color: '#3fb68b' },
  { key: 'toc', label: 'TOC · Foothills influent', unit: 'mg/L (lab)', color: '#f07d5b', threshold: 3 },
  { key: 'alk', label: 'Alkalinity · Foothills', unit: 'mg/L (lab)', color: '#f0d05b', threshold: 60 },
];
const YEAR_PALETTE = ['#e15759', '#f28e2b', '#edc948', '#59a14f', '#4fb3ff', '#b07aa1', '#ff9da7', '#9c755f', '#76b7b2'];
const yearColor = (wy, years) => YEAR_PALETTE[years.indexOf(String(wy)) % YEAR_PALETTE.length] || '#555';
const FEATURE_NAMES = {
  flow: 'flow', turb: 'turbidity', logTurbFlow: 'turbidity × flow', cond: 'conductance', ph: 'pH',
  temp: 'water temp', do: 'dissolved O₂', swe: 'snowpack SWE', prcp7: '7-day rain',
};
const FEATURE_COLORS = {
  flow: '#4fb3ff', turb: '#d9a866', logTurbFlow: '#ff8a3d', cond: '#b48cff', ph: '#8be28b',
  temp: '#ff6b9a', do: '#6be0e0', swe: '#cfe8ff', prcp7: '#7f9cff',
};
const INPUT_NAMES = {
  dLogTurbFlow3: '3-day change in turbidity × flow', dLogFlow3: '3-day change in flow', dCond3: '3-day change in conductance',
  logFlow: 'flow', prior: 'the lab value',
};
const ANNOTATIONS = {
  '2023-08-01': 'Candidate for the 2023 storm the SME described as nearly shutting Foothills down. We matched it; Denver Water has not confirmed it (register Q4).',
  '2026-08-15': 'The Aug 14–15, 2026 storm that the 3D map replays.',
};

let T;            // twin.json
let hist;         // committed daily dataset
let live = null;  // live dataset
const state = { mode: 'replay', i: 0, window: 60, playing: null, events: [], eventInfo: null, sel: null };
const hiddenSeries = new Set();

// ---------- helpers ----------
function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}
function txt(parent, x, y, s, attrs = {}) { const t = el('text', { x, y, ...attrs }, parent); t.textContent = s; return t; }
const fmt = (v, d = 1) => (v == null || Number.isNaN(v) ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }));
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const parseDay = (s) => Date.parse(s + 'T00:00:00Z');
const waterYear = (ms) => { const d = new Date(ms); return d.getUTCMonth() >= 9 ? d.getUTCFullYear() + 1 : d.getUTCFullYear(); };
const dayOfWY = (ms) => Math.round((ms - Date.UTC(waterYear(ms) - 1, 9, 1)) / DAY);
const dayOfYear = (ms) => Math.round((ms - Date.UTC(new Date(ms).getUTCFullYear(), 0, 1)) / DAY) + 1;
function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function pctRank(sorted, v) {
  if (v == null || !sorted.length) return null;
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < v) lo = m + 1; else hi = m; }
  return lo / sorted.length;
}
function niceTicks(lo, hi, n = 4) {
  if (hi === lo) return [lo];
  const step0 = (hi - lo) / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
const tip = $('#tooltip');
function showTip(e, html) { tip.innerHTML = html; tip.classList.remove('hidden'); tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 10) + 'px'; }
function hideTip() { tip.classList.add('hidden'); }

function makeDataset(daily, keys) {
  const start = parseDay(daily.start);
  const n = Object.values(daily.series)[0].length;
  const series = {};
  for (const k of keys) series[k] = daily.series[k] || new Array(n).fill(null);
  const dates = Array.from({ length: n }, (_, i) => start + i * DAY);
  series.sweMedian = dates.map((ms) => T.years.medianTrace[dayOfWY(ms)] ?? null);
  return { start, n, dates, series, index: (ms) => Math.round((ms - start) / DAY) };
}
const ALL_KEYS = ['swe', 'prcp', 'flow', 'turb', 'turbMax', 'cond', 'ph', 'temp', 'do', 'cheStor', 'strStor', 'toc', 'alk'];
let sorted = {};

// ---------- model ----------
function features(ds, k) {
  const s = ds.series, flow = s.flow[k], turb = s.turb[k];
  const p = [];
  for (let j = k - 6; j <= k; j++) p.push(j >= 0 ? s.prcp[j] : null);
  return {
    logTurbFlow: flow != null && turb != null ? Math.log1p(turb * flow) : null,
    logFlow: flow > 0 ? Math.log(flow) : null,
    turb, flow, cond: s.cond[k], ph: s.ph[k], temp: s.temp[k], do: s['do'][k], swe: s.swe[k],
    prcp7: p.every((v) => v != null) ? p.reduce((a, b) => a + b, 0) : null,
  };
}
function modelInputs(ds, k, targetMs, prior) {
  const x = features(ds, k);
  const a = 2 * Math.PI * (dayOfYear(targetMs) - 1) / 365.25;
  x.sinDoy = Math.sin(a); x.cosDoy = Math.cos(a); x.prior = prior;
  const b = k - 3 >= 0 ? features(ds, k - 3) : {};
  for (const [key, src] of [['dLogTurbFlow3', 'logTurbFlow'], ['dLogFlow3', 'logFlow'], ['dCond3', 'cond']]) {
    x[key] = x[src] != null && b[src] != null ? x[src] - b[src] : null;
  }
  return x;
}
function predict(m, x) {
  if (m.delta && x.prior == null) return null;
  let y = (m.delta ? x.prior : 0) + m.intercept;
  for (let j = 0; j < m.features.length; j++) {
    const v = x[m.features[j]];
    if (v == null) return null;
    y += m.coef[j] * (v - m.mean[j]) / m.std[j];
  }
  return y;
}
function project(ds, k, priors, which) {
  // priors: {toc, alk}; which: 'splitModel' (hindcast) or 'allModel' (live forecast)
  const out = { toc: [], alk: [] };
  for (const target of ['toc', 'alk']) {
    for (const hz of T.models[target].horizons) {
      const tMs = ds.dates[k] + hz.h * DAY;
      const x = modelInputs(ds, k, tMs, priors[target]);
      out[target].push({
        h: hz.h, ms: tMs,
        hybrid: predict(hz.hybrid[which], x),
        upstream: predict(hz.upstream[which], x),
        persistence: priors[target],
        rmse: hz.hybrid.test.rmse,
      });
    }
  }
  return out;
}

// ---------- events ----------
function detectEvents(ds, turbP, flowP, gap) {
  const s = ds.series, n = ds.n;
  const rise = new Array(n).fill(null);
  for (let i = 3; i < n; i++) if (s.flow[i] != null && s.flow[i - 3] != null) rise[i] = s.flow[i] - s.flow[i - 3];
  const tThr = quantile(s.turbMax.filter((v) => v != null).sort((a, b) => a - b), turbP / 100);
  const fThr = quantile(rise.filter((v) => v != null).sort((a, b) => a - b), flowP / 100);
  const events = [];
  let cur = null;
  for (let i = 0; i < n; i++) {
    const t = s.turbMax[i] != null && s.turbMax[i] >= tThr;
    const f = rise[i] != null && rise[i] >= fThr;
    if (!t && !f) continue;
    if (cur && i - cur.end <= gap + 1) { cur.end = i; } else { cur = { start: i, end: i, turb: false, flow: false }; events.push(cur); }
    cur.turb ||= t; cur.flow ||= f;
  }
  for (const ev of events) Object.assign(ev, characterise(ds, ev, rise));
  return { events, tThr, fThr };
}
function characterise(ds, ev, rise) {
  const s = ds.series, W = 14, lastI = Math.min(ds.n - 1, ev.end + W);
  const argmax = (key, a, b, sign = 1) => {
    let best = null, bi = null;
    for (let j = a; j <= b; j++) { const v = s[key][j]; if (v != null && (best == null || sign * v > sign * best)) { best = v; bi = j; } }
    return [best, bi];
  };
  const before = (key) => { for (let j = ev.start - 1; j >= Math.max(0, ev.start - 4); j--) if (s[key][j] != null) return s[key][j]; return null; };
  const [peakTurb, peakTurbI] = argmax('turbMax', ev.start, ev.end);
  const [peakFlow] = argmax('flow', ev.start, ev.end);
  const maxRise = Math.max(...range(ev.start, ev.end).map((j) => rise[j] ?? -Infinity));
  const [tocMax, tocMaxI] = argmax('toc', ev.start, lastI);
  const [alkMin, alkMinI] = argmax('alk', ev.start, lastI, -1);
  const stor = (key) => { const a = before(key), b = s[key][Math.min(ds.n - 1, ev.end + 3)]; return a != null && b != null ? b - a : null; };
  const tocBase = before('toc');
  return {
    peakTurb, peakTurbI, peakFlow, maxRise: Number.isFinite(maxRise) ? maxRise : null,
    tocBase, tocMax, tocLag: tocMaxI != null ? tocMaxI - (peakTurbI ?? ev.start) : null,
    tocOver: tocMax != null ? tocMax > T.constants.tocLimit : null, tocAlready: tocBase != null && tocBase > T.constants.tocLimit,
    alkBase: before('alk'), alkMin, alkLag: alkMinI != null ? alkMinI - (peakTurbI ?? ev.start) : null,
    dStr: stor('strStor'), dChe: stor('cheStor'),
  };
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, j) => a + j);
function eventAt(i) { return state.events.find((ev) => i >= ev.start && i <= ev.end); }

// ---------- journey strip ----------
let particles = [];
function valueAt(ds, key, i, lookback) {
  for (let j = i; j >= Math.max(0, i - lookback); j--) if (ds.series[key][j] != null) return { v: ds.series[key][j], j };
  return { v: null, j: null };
}
function turbColor(t) {
  if (t == null) return '#5b7a92';
  const f = Math.min(1, Math.log10(Math.max(t, 0.5) / 0.5) / Math.log10(300 / 0.5));
  const lerp = (a, b) => Math.round(a + (b - a) * f);
  return `rgb(${lerp(95, 150)},${lerp(185, 100)},${lerp(255, 40)})`;
}
function renderJourney(ds, i, { lookback = 0, liveMode = false } = {}) {
  const svg = $('#journey');
  svg.innerHTML = '';
  const g = (key) => valueAt(ds, key, i, lookback);
  const swe = g('swe'), flow = g('flow'), turb = g('turb'), turbMax = g('turbMax'), cond = g('cond');
  const che = g('cheStor'), str = g('strStor'), toc = g('toc'), alk = g('alk');
  const cap = T.constants.capacityAF;
  const wy = waterYear(ds.dates[i]);
  const wyLabel = T.years.labels[wy];
  const med = ds.series.sweMedian[i];
  const turbP = pctRank(sorted.turbMax, turbMax.v);
  let prcp7 = 0, prcpN = 0;
  for (let j = Math.max(0, i - 6); j <= i; j++) if (ds.series.prcp[j] != null) { prcp7 += ds.series.prcp[j]; prcpN++; }
  const d7 = (key) => { const a = valueAt(ds, key, i - 7, 3).v, b = g(key).v; return a != null && b != null ? b - a : null; };
  const signed = (v, d = 0) => (v == null ? '—' : (v >= 0 ? '+' : '') + fmt(v, d));
  const asOf = (r) => (lookback && r.j != null && r.j !== i ? ` (${iso(ds.dates[r.j]).slice(5)})` : '');
  const tocLag = bestLag('toc', 'all', 'turb'), alkLag = bestLag('alk', 'all', 'cond');

  const nodes = [
    { x: 105, title: 'Snowpack', sub0: 'Hoosier Pass SNOTEL 531', status: 'neutral',
      lines: [`SWE ${fmt(swe.v)} in${asOf(swe)}`, med ? `${fmt(100 * (swe.v ?? 0) / med, 0)}% of median for date` : 'median ≈ 0 this time of year'],
      sub: wyLabel ? `WY${wy}: ${wyLabel.label} (provisional, ours)` : `WY${wy}` },
    { x: 345, title: 'Cheesman Reservoir', sub0: 'DWR CHERESCO', status: 'neutral',
      lines: [`${fmt(che.v, 0)} AF${asOf(che)}`, che.v != null ? `${fmt(100 * che.v / cap.cheStor, 0)}% of ${fmt(cap.cheStor, 0)} AF` : ''],
      sub: `7-day change ${signed(d7('cheStor'))} AF` },
    { x: 600, title: 'River above Strontia', sub0: 'DWR PLASPLCO · USGS 06707525',
      status: turbP == null ? 'neutral' : turbP >= 0.99 ? 'bad' : turbP >= 0.9 ? 'warn' : 'ok',
      lines: [`Flow ${fmt(flow.v, 0)} cfs${asOf(flow)}`, `Turbidity ${fmt(turb.v)} · max ${fmt(turbMax.v, 0)} FNU`, `Conductance ${fmt(cond.v, 0)} µS/cm`],
      sub: turbP == null ? 'no turbidity reading' : `turbidity max above ${fmt(100 * turbP, 1)}% of record days` },
    { x: 855, title: 'Strontia Springs', sub0: 'DWR STRRESCO · profiling sonde', status: 'neutral',
      lines: [`${fmt(str.v, 0)} AF${asOf(str)}`, str.v != null ? `${fmt(100 * str.v / cap.strStor, 0)}% of ${fmt(cap.strStor, 0)} AF` : '', sondeLine(ds.dates[i])],
      sub: `7-day change ${signed(d7('strStor'))} AF` },
    { x: 1095, title: 'Foothills intake', sub0: 'lab grab samples',
      status: liveMode ? 'neutral' : (toc.v > T.constants.tocLimit ? 'bad' : alk.v != null && alk.v < T.constants.alkLimit ? 'warn' : toc.v != null ? 'ok' : 'neutral'),
      lines: liveMode ? ['TOC and alkalinity are', 'not public: see Forecast'] : [`TOC ${fmt(toc.v, 2)} mg/L`, `Alkalinity ${fmt(alk.v, 1)} mg/L`],
      sub: liveMode ? '' : [toc.v > 3 ? 'TOC above 3' : null, alk.v != null && alk.v < 60 ? 'alk below 60' : null].filter(Boolean).join(' · ') || (toc.v == null ? 'no lab value this day' : 'within thresholds') },
  ];
  const W = 200, H = 140, Y = 62, RIVER = 232;
  const links = [
    { a: 0, b: 1, label: ['snowmelt runs into the South Platte'], color: '#cfe8ff' },
    { a: 1, b: 2, label: ['North Fork joins 2 km above the gage,', 'carrying Roberts Tunnel (Dillon) water'], color: turbColor(turb.v) },
    { a: 2, b: 3, label: ['river enters the reservoir;', 'Aurora also draws from it'], color: turbColor(turb.v) },
    { a: 3, b: 4, label: [`Conduit 26 · water clock ≈${T.constants.transitHours} h (Denver Water)`,
      `signal clock (this data): turbidity→TOC ${tocLag.lag} d,`, `conductance→alkalinity ${alkLag.lag} d`], color: turbColor(turb.v) },
  ];
  const flowN = flow.v == null ? 3 : Math.max(3, Math.min(40, Math.round(flow.v / 30)));
  particles = [];
  el('line', { x1: nodes[0].x, y1: RIVER, x2: nodes[4].x, y2: RIVER, class: 'link' }, svg);
  for (const lk of links) {
    const x1 = nodes[lk.a].x, x2 = nodes[lk.b].x;
    lk.label.forEach((l, k) => txt(svg, (x1 + x2) / 2, RIVER + 22 + k * 14, l, { 'text-anchor': 'middle', class: 'link-label' }));
    const count = lk.a === 0 ? Math.max(2, Math.round((swe.v ?? 0) * 1.5)) : flowN;
    for (let k = 0; k < count; k++) {
      const c = el('circle', { r: 3, fill: lk.color, cx: x1, cy: RIVER }, svg);
      particles.push({ c, x1, x2, y: RIVER, off: k / count, jitter: (Math.random() - 0.5) * 7 });
    }
  }
  const stroke = { neutral: '#3b5064', ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)' };
  for (const n of nodes) {
    const gx = n.x - W / 2;
    el('line', { x1: n.x, x2: n.x, y1: Y + H, y2: RIVER, stroke: '#2d5d80', 'stroke-width': 2 }, svg);
    el('rect', { x: gx, y: Y, width: W, height: H, rx: 10, fill: '#0f1a24', stroke: stroke[n.status], class: 'node-box' }, svg);
    txt(svg, gx + 10, Y + 21, n.title, { class: 'node-title' });
    txt(svg, gx + 10, Y + 37, n.sub0, { class: 'node-sub' });
    n.lines.forEach((l, k) => txt(svg, gx + 10, Y + 60 + k * 19, l, { class: 'node-line' }));
    if (n.sub) txt(svg, gx + 10, Y + H - 11, n.sub, { class: 'node-sub' });
  }
  // Rain over the river
  const cloudX = nodes[2].x;
  el('ellipse', { cx: cloudX, cy: 30, rx: 150, ry: 18, fill: prcp7 > 0.5 ? '#6f8aa3' : '#2a3a4a' }, svg);
  txt(svg, cloudX, 35, prcpN ? `7-day rain ${fmt(prcp7, 2)} in · USC00058022` : 'rain: no data', { 'text-anchor': 'middle', class: 'node-line' });
  txt(svg, 8, 18, 'upstream → downstream', { class: 'node-sub' });
}
function animate(t) {
  for (const p of particles) {
    const f = (p.off + t / 6000) % 1;
    p.c.setAttribute('cx', p.x1 + (p.x2 - p.x1) * f);
    p.c.setAttribute('cy', p.y + p.jitter * Math.sin(f * 12));
  }
  requestAnimationFrame(animate);
}
function bestLag(target, season, feat) {
  const r = T.lags[target][season][feat].rho;
  let best = 0;
  r.forEach((v, j) => { if (v != null && Math.abs(v) > Math.abs(r[best] ?? 0)) best = j; });
  return { lag: best, rho: r[best], n: T.lags[target][season][feat].n[best] };
}

// ---------- lanes ----------
function renderLanes(container, ds, { i, i0, i1, lanes, events = [], hind = null, splitIdx = {}, onPick }) {
  container.innerHTML = '';
  const W = Math.max(640, container.clientWidth || 900), L = 190, R = 14, H = 58, G = 18, top = 6;
  const svg = el('svg', { width: W, height: top + lanes.length * (H + G) + 22 }, null);
  container.appendChild(svg);
  const span = Math.max(1, i1 - i0);
  const x = (j) => L + ((j - i0) / span) * (W - L - R);
  lanes.forEach((lane, idx) => {
    const y0 = top + idx * (H + G);
    const s = ds.series[lane.key];
    const tr = lane.log ? (v) => Math.log10(Math.max(v, 0.1)) : (v) => v;
    const vals = [];
    for (let j = i0; j <= i1; j++) {
      for (const k of [lane.key, lane.extra, lane.median ? 'sweMedian' : null]) if (k && ds.series[k][j] != null) vals.push(tr(ds.series[k][j]));
    }
    if (lane.threshold != null) vals.push(lane.threshold);
    if (hind && hind[lane.key]) hind[lane.key].forEach((p) => p.v != null && vals.push(p.v));
    txt(svg, 8, y0 + 13, lane.label, { class: 'lane-label' });
    txt(svg, 8, y0 + 27, lane.unit);
    el('rect', { x: L, y: y0, width: W - L - R, height: H, fill: '#101922' }, svg);
    if (!vals.length) { txt(svg, L + 10, y0 + H / 2 + 4, 'no readings in this window'); return; }
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (lane.bars) lo = 0;
    if (hi === lo) hi = lo + 1;
    const floor = lo;
    const pad = (hi - lo) * 0.08; lo -= lane.bars ? 0 : pad; hi += pad;
    if (!lane.log && floor >= 0) lo = Math.max(lo, 0);
    const y = (v) => y0 + H - ((tr(v) - lo) / (hi - lo)) * H;
    txt(svg, L - 4, y0 + 9, lane.log ? fmt(10 ** hi, 0) : fmt(hi, hi > 100 ? 0 : 1), { 'text-anchor': 'end' });
    txt(svg, L - 4, y0 + H, lane.log ? fmt(10 ** lo, 1) : fmt(lo, hi > 100 ? 0 : 1), { 'text-anchor': 'end' });
    for (const ev of events) {
      if (ev.end < i0 || ev.start > i1) continue;
      el('rect', { x: x(Math.max(i0, ev.start) - 0.5), y: y0, width: Math.max(2, x(ev.end + 0.5) - x(ev.start - 0.5)), height: H, class: 'event-band' }, svg);
    }
    if (splitIdx[lane.key] != null && splitIdx[lane.key] >= i0 && splitIdx[lane.key] <= i1) {
      el('line', { x1: x(splitIdx[lane.key]), x2: x(splitIdx[lane.key]), y1: y0, y2: y0 + H, class: 'split-line' }, svg);
      txt(svg, x(splitIdx[lane.key]) + 3, y0 + H - 3, 'model test period →');
    }
    if (lane.threshold != null) el('line', { x1: L, x2: W - R, y1: y(lane.threshold), y2: y(lane.threshold), class: 'threshold' }, svg);
    const path = (key, attrs) => {
      let d = '', pen = false;
      for (let j = i0; j <= i1; j++) {
        const v = ds.series[key][j];
        if (v == null) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + x(j).toFixed(1) + ',' + y(v).toFixed(1);
        pen = true;
      }
      if (d) el('path', { d, fill: 'none', ...attrs }, svg);
    };
    if (lane.median) path('sweMedian', { stroke: '#6b7f92', 'stroke-dasharray': '3 3', 'stroke-width': 1 });
    if (lane.bars) {
      const bw = Math.max(1, (W - L - R) / span - 0.5);
      for (let j = i0; j <= i1; j++) { const v = s[j]; if (v) el('rect', { x: x(j) - bw / 2, y: y(v), width: bw, height: y0 + H - y(v), fill: lane.color }, svg); }
    } else {
      if (lane.extra) path(lane.extra, { stroke: lane.extraColor, 'stroke-width': 1 });
      path(lane.key, { stroke: lane.color, 'stroke-width': 1.6 });
    }
    if (hind && hind[lane.key] && hind[lane.key].length) {
      const pts = hind[lane.key].filter((p) => p.v != null && p.j <= i1);
      if (pts.length) {
        el('path', { d: pts.map((p, k) => (k ? 'L' : 'M') + x(p.j).toFixed(1) + ',' + y(p.v).toFixed(1)).join(''), fill: 'none', stroke: '#fff', 'stroke-dasharray': '2 2', 'stroke-width': 1.2 }, svg);
        pts.forEach((p) => el('circle', { cx: x(p.j), cy: y(p.v), r: 2.8, fill: 'none', stroke: '#fff' }, svg));
      }
    }
    if (i >= i0 && i <= i1) {
      const v = s[i];
      txt(svg, 8, y0 + 45, v == null ? '—' : fmt(v, lane.key === 'toc' || lane.key === 'prcp' ? 2 : v > 100 ? 0 : 1), { class: 'lane-value' });
    }
  });
  // month axis
  const axisY = top + lanes.length * (H + G) - 4;
  const every = span > 500 ? 3 : 1;
  for (let j = i0; j <= i1; j++) {
    const d = new Date(ds.dates[j]);
    if (d.getUTCDate() !== 1 || d.getUTCMonth() % every) continue;
    el('line', { x1: x(j), x2: x(j), y1: top, y2: axisY, class: 'grid-line' }, svg);
    txt(svg, x(j) + 2, axisY + 14, d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) + (d.getUTCMonth() === 0 || j === i0 ? ' ' + d.getUTCFullYear() : ''));
  }
  if (i >= i0 && i <= i1) el('line', { x1: x(i), x2: x(i), y1: top, y2: axisY, class: 'cursor' }, svg);
  // interaction
  const hit = el('rect', { x: L, y: 0, width: W - L - R, height: axisY, fill: 'transparent', style: 'cursor:crosshair' }, svg);
  const pick = (e) => { const r = svg.getBoundingClientRect(); return Math.max(i0, Math.min(i1, Math.round(i0 + ((e.clientX - r.left - L) / (W - L - R)) * span))); };
  hit.addEventListener('mousemove', (e) => {
    const j = pick(e);
    const rows = lanes.map((ln) => `<tr><td>${ln.label.split(' · ')[0]}</td><td>${fmt(ds.series[ln.key][j], ln.key === 'toc' || ln.key === 'prcp' ? 2 : 1)}</td></tr>`).join('');
    showTip(e, `<b>${iso(ds.dates[j])}</b><table>${rows}</table>`);
  });
  hit.addEventListener('mouseleave', hideTip);
  if (onPick) hit.addEventListener('click', (e) => onPick(pick(e)));
}

// ---------- generic xy chart ----------
function xyChart({ width = 560, height = 240, xDomain, yDomain, xTicks, yTicks, xFmt = (v) => v, yFmt = (v) => v, series = [], hlines = [], bands = [], bars = [], vbands = [], xLabel = '', yLabel = '' }) {
  const L = 50, R = 12, Tm = 10, B = 34;
  const svg = el('svg', { width: '100%', viewBox: `0 0 ${width} ${height}` });
  const x = (v) => L + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * (width - L - R);
  const y = (v) => Tm + (1 - (v - yDomain[0]) / (yDomain[1] - yDomain[0])) * (height - Tm - B);
  for (const t of yTicks || niceTicks(yDomain[0], yDomain[1])) {
    el('line', { x1: L, x2: width - R, y1: y(t), y2: y(t), class: 'grid-line' }, svg);
    txt(svg, L - 4, y(t) + 4, yFmt(t), { 'text-anchor': 'end' });
  }
  for (const t of xTicks || niceTicks(xDomain[0], xDomain[1], 6)) txt(svg, x(t), height - B + 14, xFmt(t), { 'text-anchor': 'middle' });
  if (xLabel) txt(svg, (L + width - R) / 2, height - 4, xLabel, { 'text-anchor': 'middle' });
  if (yLabel) txt(svg, 12, Tm + 8, yLabel);
  for (const b of bars) {
    el('rect', { x: x(b.x) - b.w / 2, y: y(Math.max(0, b.y)), width: b.w, height: Math.abs(y(b.y) - y(0)), fill: b.color }, svg)
      .appendChild(Object.assign(document.createElementNS(SVGNS, 'title'), { textContent: b.title || '' }));
  }
  for (const v of vbands) {
    el('rect', { x: x(v.x0), y: Tm, width: x(v.x1) - x(v.x0), height: height - Tm - B, fill: v.color || 'var(--warn)', opacity: 0.12 }, svg);
    if (v.label) txt(svg, (x(v.x0) + x(v.x1)) / 2, Tm + 12, v.label, { 'text-anchor': 'middle' });
  }
  const layer = (key) => (key ? el('g', { 'data-series': key, style: hiddenSeries.has(key) ? 'display:none' : null }, svg) : svg);
  for (const b of bands) {
    const up = b.points.map((p) => `${x(p[0])},${y(p[2])}`), dn = b.points.slice().reverse().map((p) => `${x(p[0])},${y(p[1])}`);
    el('polygon', { points: up.concat(dn).join(' '), fill: b.color, opacity: 0.18 }, layer(b.key));
  }
  for (const h of hlines) {
    el('line', { x1: L, x2: width - R, y1: y(h.y), y2: y(h.y), stroke: h.color || 'var(--bad)', 'stroke-dasharray': '4 3' }, svg);
    if (h.label) txt(svg, width - R - 4, y(h.y) - 4, h.label, { 'text-anchor': 'end' });
  }
  for (const s of series) {
    const pts = s.points.filter((p) => p[1] != null);
    if (!pts.length) continue;
    let d = '', pen = false;
    for (const p of s.points) { if (p[1] == null) { pen = false; continue; } d += (pen ? 'L' : 'M') + x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1); pen = true; }
    const g = layer(s.key);
    if (s.width !== 0) el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': s.width || 1.6, 'stroke-dasharray': s.dash || null, opacity: s.opacity ?? 1 }, g);
    if (s.dots) pts.forEach((p) => el('circle', { cx: x(p[0]), cy: y(p[1]), r: s.r || 3, fill: s.color }, g)
      .appendChild(Object.assign(document.createElementNS(SVGNS, 'title'), { textContent: `${s.label || ''} ${xFmt(p[0])}: ${yFmt(p[1])}` })));
  }
  return svg;
}
// Items are [color, label, dashed, key]; a key makes the entry toggle chart layers with the same key.
function legend(items) {
  return `<div class="legend">${items.map(([c, l, dash, key]) => `<span${key ? ` class="toggle${hiddenSeries.has(key) ? ' off' : ''}" data-series="${key}" title="Click to show or hide"` : ''}><i style="background:${c};${dash ? 'height:0;border-top:2px dashed ' + c : ''}"></i>${l}</span>`).join('')}</div>`;
}
function toggleSeries(e) {
  const item = e.target.closest('.legend [data-series]');
  if (!item) return;
  const key = item.dataset.series, off = !hiddenSeries.has(key), sel = `[data-series="${CSS.escape(key)}"]`;
  if (off) hiddenSeries.add(key); else hiddenSeries.delete(key);
  document.querySelectorAll('.legend ' + sel).forEach((s) => s.classList.toggle('off', off));
  document.querySelectorAll('g' + sel).forEach((g) => { g.style.display = off ? 'none' : ''; });
}

// ---------- replay ----------
function lanesWindow(ds, i) {
  if (!state.window) return [0, ds.n - 1];
  return [Math.max(0, i - state.window), Math.min(ds.n - 1, i + state.window)];
}
function renderReplay() {
  const i = state.i, ms = hist.dates[i];
  $('#scrub').value = i;
  const ev = eventAt(i);
  $('#journey-title').textContent = 'The journey, replayed';
  $('#journey-date').textContent = `${iso(ms)} · WY${waterYear(ms)}${ev ? ' · event in progress' : ''}`;
  $('#journey-badge').classList.add('hidden');
  renderJourney(hist, i);
  $('#story').innerHTML = story(hist, i, ev);
  const priors = { toc: hist.series.toc[i], alk: hist.series.alk[i] };
  const proj = project(hist, i, priors, 'splitModel');
  const hind = {};
  for (const t of ['toc', 'alk']) hind[t] = priors[t] == null ? [] : [{ j: i, v: priors[t] }, ...proj[t].map((p) => ({ j: i + p.h, v: p.hybrid }))];
  const [i0, i1] = lanesWindow(hist, i);
  const splitIdx = { toc: hist.index(parseDay(T.models.toc.splitDate)), alk: hist.index(parseDay(T.models.alk.splitDate)) };
  renderLanes($('#lanes'), hist, { i, i0, i1, lanes: LANES, events: state.events, hind, splitIdx, onPick: setDay });
  renderHindcast(i, proj, splitIdx);
  $('#replay-analogs').innerHTML = analogsHtml(analogs(hist, i, true));
  highlightEvent();
}
function story(ds, i, ev) {
  const s = ds.series, ms = ds.dates[i];
  const parts = [];
  const med = s.sweMedian[i];
  if (s.swe[i] != null) parts.push(`Hoosier Pass holds <b>${fmt(s.swe[i])} in</b> of snow water${med ? ` (${fmt(100 * s.swe[i] / med, 0)}% of the median for this date)` : ''}.`);
  if (s.flow[i] != null) parts.push(`The South Platte runs <b>${fmt(s.flow[i], 0)} cfs</b>.`);
  if (s.turbMax[i] != null) {
    const top = s.turbMax[i] >= sorted.turbMax[sorted.turbMax.length - 1];
    parts.push(`Turbidity peaks at <b>${fmt(s.turbMax[i], 0)} FNU</b>, ${top ? 'the highest day in the record' : `higher than ${fmt(100 * pctRank(sorted.turbMax, s.turbMax[i]), 1)}% of days on record`}.`);
  }
  else parts.push('The river gage has no turbidity reading today.');
  if (s.toc[i] != null) parts.push(`At Foothills the lab found TOC <b>${fmt(s.toc[i], 2)}</b> and alkalinity <b>${fmt(s.alk[i], 1)} mg/L</b>.`);
  if (ev) parts.push(`<span class="pill warn">event ${iso(ds.dates[ev.start])}: ${[ev.turb && 'turbidity', ev.flow && 'flow rise'].filter(Boolean).join(' + ')}</span>`);
  const note = ANNOTATIONS[iso(ms)];
  if (note) parts.push(`<br><span class="pill">note</span> ${note}`);
  return parts.join(' ');
}
function renderHindcast(i, proj, splitIdx) {
  const rows = (t, d) => proj[t].map((p) => {
    const j = i + p.h, actual = j < hist.n ? hist.series[t][j] : null;
    const inSample = j < splitIdx[t];
    const err = (v) => (v == null || actual == null ? '' : ` <span class="note">(${v - actual >= 0 ? '+' : ''}${fmt(v - actual, d)})</span>`);
    return `<tr${p.h === DECISION_H ? ' class="decision"' : ''}><td>+${p.h} d${inSample ? '*' : ''}</td><td>${fmt(p.hybrid, d)}${err(p.hybrid)}</td><td>${fmt(p.persistence, d)}${err(p.persistence)}</td><td>${fmt(actual, d)}</td></tr>`;
  }).join('');
  if (hist.series.toc[i] == null) {
    $('#hindcast').innerHTML = '<p class="note">No lab result on this day, so there is nothing to project from. Pick a day with a TOC value.</p>';
    return;
  }
  if (proj.toc.every((p) => p.hybrid == null)) {
    const x = modelInputs(hist, i, hist.dates[i], null);
    const missing = [...new Set(T.models.toc.horizons[0].hybrid.splitModel.features.concat(T.models.alk.horizons[0].hybrid.splitModel.features))]
      .filter((f) => x[f] == null).map((f) => INPUT_NAMES[f] || FEATURE_NAMES[f] || f);
    $('#hindcast').innerHTML = `<p class="note">No projection: the model needs ${missing.join(', ')}, and the gage record is missing it here (or 3 days earlier). Step a day or two to either side.</p>`;
    return;
  }
  $('#hindcast').innerHTML = ['toc', 'alk'].map((t) => `
    <b>${t === 'toc' ? 'TOC' : 'Alkalinity'}</b> <span class="note">mg/L, error vs lab in brackets</span>
    <table><tr><th>ahead</th><th>hybrid</th><th>persistence</th><th>lab</th></tr>${rows(t, t === 'toc' ? 2 : 1)}</table>`).join('') +
    `<p class="note">* target day is in the training half, so that row is in-sample. The highlighted +${DECISION_H} d row is Jake's action window. The dashed white line on the lanes is the hybrid projection.</p>`;
}
function renderEvents() {
  const turbP = +$('#turb-p').value, flowP = +$('#flow-p').value, gap = +$('#gap').value;
  $('#turb-p-out').textContent = turbP; $('#flow-p-out').textContent = flowP; $('#gap-out').textContent = gap;
  const info = detectEvents(hist, turbP, flowP, gap);
  state.events = info.events; state.eventInfo = info;
  $('#event-count').textContent = `${info.events.length} found`;
  const rows = info.events.map((ev, k) => `
    <tr class="clickable" data-k="${k}">
      <td>${iso(hist.dates[ev.start])}${ev.end > ev.start ? '<span class="note"> +' + (ev.end - ev.start) + 'd</span>' : ''}</td>
      <td>${ev.turb ? 'T' : ''}${ev.flow ? 'F' : ''}</td>
      <td>${fmt(ev.peakTurb, 0)}</td><td>${fmt(ev.peakFlow, 0)}</td>
      <td>${ev.tocMax != null ? fmt(ev.tocMax - (ev.tocBase ?? ev.tocMax), 2) : '—'}<span class="note">${ev.tocLag != null ? ' @' + ev.tocLag + 'd' : ''}</span></td>
      <td>${ev.tocOver == null ? '—' : ev.tocAlready ? 'already' : ev.tocOver ? '<b>yes</b>' : 'no'}</td>
      <td>${fmt(ev.dStr, 0)}</td>
    </tr>`).join('');
  const over = info.events.filter((ev) => ev.tocOver && !ev.tocAlready).length;
  const already = info.events.filter((ev) => ev.tocAlready).length;
  $('#events').innerHTML = `<p class="note">Thresholds now: turbidity max ≥ ${fmt(info.tThr, 0)} FNU, 3-day flow rise ≥ ${fmt(info.fThr, 0)} cfs.
    ΔTOC = highest lab TOC within 14 d after the event, minus the value just before it. @ = days after peak turbidity (or event start).
    TOC&gt;3 = did plant TOC go above 3 within 14 d ("already" = it was above 3 before the event).
    ΔStr = Strontia storage change across the event, in acre-feet.</p>
    <p><b>${over}</b> of ${info.events.length} events were followed by TOC above 3 at the plant${already ? `, and ${already} started with it already above 3` : ''}.
    The rest match what Jake called minor events: the turbidity shows up, but TOC barely moves. Whether "major" should mean TOC above 3 is for Denver Water to decide.</p>
    <div class="events-scroll"><table><tr><th>start</th><th>trig</th><th>turb max</th><th>flow</th><th>ΔTOC</th><th>TOC&gt;3</th><th>ΔStr AF</th></tr>${rows}</table></div>`;
  $('#events').querySelectorAll('tr.clickable').forEach((tr) => tr.addEventListener('click', () => setDay(state.events[+tr.dataset.k].start)));
  $('#event-jump').innerHTML = '<option value="">jump to event…</option>' + info.events.map((ev, k) => `<option value="${k}">${iso(hist.dates[ev.start])} ${ev.turb ? 'turbidity' : ''}${ev.turb && ev.flow ? ' + ' : ''}${ev.flow ? 'flow' : ''}</option>`).join('');
}
function highlightEvent() {
  const ev = eventAt(state.i);
  $('#events').querySelectorAll('tr.clickable').forEach((tr) => tr.classList.toggle('sel', ev && state.events[+tr.dataset.k] === ev));
}
function setDay(i) {
  state.i = Math.max(0, Math.min(hist.n - 1, i));
  history.replaceState(null, '', '#' + iso(hist.dates[state.i]));
  renderReplay();
}
function togglePlay() {
  if (state.playing) { clearInterval(state.playing); state.playing = null; $('#play').textContent = '▶'; return; }
  $('#play').textContent = '❚❚';
  state.playing = setInterval(() => { if (state.i >= hist.n - 1) return togglePlay(); setDay(state.i + 1); }, +$('#speed').value);
}

// ---------- live ----------
async function loadLive(force = false) {
  if (live && !force) return live;
  $('#live-status').textContent = 'Fetching USGS, DWR, NRCS, NOAA and NWS…';
  $('#journey').innerHTML = '';
  $('#journey-date').textContent = 'loading live readings…';
  $('#story').textContent = '';
  try {
    const res = await fetch('api/live?days=60');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    live = makeDataset(payload.daily, ALL_KEYS);
    live.payload = payload;
    const errs = payload.errors.length ? ` Failed: ${payload.errors.join('; ')}` : '';
    $('#live-status').textContent = `Fetched ${payload.fetched}. All values provisional.${errs}`;
  } catch (err) {
    $('#live-status').textContent = `Live data needs the prototype server: python teams/cendit/prototype/server.py (${err.message}).`;
    live = null;
  }
  return live;
}
function lastIndexWith(ds, keys) {
  for (let j = ds.n - 1; j >= 0; j--) if (keys.every((k) => ds.series[k][j] != null)) return j;
  return null;
}
async function renderLive() {
  $('#journey-title').textContent = 'The journey, now';
  $('#journey-badge').classList.remove('hidden');
  const ds = await loadLive();
  if (!ds) { $('#journey').innerHTML = ''; $('#story').textContent = 'No live data.'; return; }
  const i = ds.n - 1;
  $('#journey-date').textContent = `latest readings to ${iso(ds.dates[i])}`;
  renderJourney(ds, i, { lookback: 6, liveMode: true });
  const k = lastIndexWith(ds, ['flow', 'turb', 'cond']);
  $('#story').innerHTML = k == null ? 'Upstream readings incomplete.' :
    `Most recent complete river day <b>${iso(ds.dates[k])}</b>: ${fmt(ds.series.flow[k], 0)} cfs, turbidity ${fmt(ds.series.turb[k])} FNU (max ${fmt(ds.series.turbMax[k], 0)}), conductance ${fmt(ds.series.cond[k], 0)} µS/cm. Provisional; USGS and DWR revise after publication.`;
  renderLanes($('#live-lanes'), ds, { i, i0: 0, i1: ds.n - 1, lanes: LANES.filter((l) => !['toc', 'alk'].includes(l.key)) });
  $('#live-weather').innerHTML = weatherHtml(ds.payload.nws);
}
function weatherHtml(nws) {
  if (!nws) return '<p class="note">NWS unavailable.</p>';
  const tz = { timeZone: 'America/Denver' };
  const days = {};
  for (const q of nws.qpf) {
    const d = new Date(q.t.split('/')[0]).toLocaleDateString('en-CA', tz);
    (days[d] ||= { mm: 0, pop: 0, text: '' }).mm += q.mm || 0;
  }
  for (const h of nws.hourly) {
    const dt = new Date(h.t), d = dt.toLocaleDateString('en-CA', tz);
    const e = (days[d] ||= { mm: 0, pop: 0, text: '' });
    e.pop = Math.max(e.pop, h.pop || 0);
    if (!e.text || dt.toLocaleString('en-US', { hour: 'numeric', hour12: false, ...tz }) === '14') e.text = h.text;
  }
  const rows = Object.entries(days).sort().slice(0, 8).map(([d, e]) => `<tr><td>${d.slice(5)}</td><td>${fmt(e.mm / 25.4, 2)}</td><td>${e.pop}%</td><td style="text-align:left;white-space:normal">${e.text}</td></tr>`).join('');
  const alerts = nws.alerts.length ? nws.alerts.map((a) => `<div class="alert"><b>${a.event}</b> (${a.severity})<br>${a.headline || ''}</div>`).join('') : '<p class="note">No active NWS alerts at Strontia Springs Dam.</p>';
  const total = Object.values(days).reduce((a, e) => a + e.mm, 0) / 25.4;
  return `${alerts}<p class="note">Forecast rain total ≈ <b>${fmt(total, 2)} in</b> (NWS gridded QPF, which covers only the first few days).</p>
    <table><tr><th>day</th><th>rain in</th><th>max PoP</th><th style="text-align:left">afternoon</th></tr>${rows}</table>`;
}

// ---------- forecast ----------
async function renderForecast() {
  $('#journey-title').textContent = 'The journey, now';
  $('#journey-badge').classList.remove('hidden');
  const ds = await loadLive();
  const lastLab = (() => { for (let j = hist.n - 1; j >= 0; j--) if (hist.series.toc[j] != null && hist.series.alk[j] != null) return j; return null; })();
  if (!$('#fc-toc').value && lastLab != null) {
    $('#fc-toc').value = hist.series.toc[lastLab]; $('#fc-alk').value = hist.series.alk[lastLab]; $('#fc-labdate').value = iso(hist.dates[lastLab]);
  }
  if (!ds) { $('#fc-basis').textContent = 'Forecast needs live upstream readings: run server.py.'; return; }
  renderJourney(ds, ds.n - 1, { lookback: 6, liveMode: true });
  $('#journey-date').textContent = `latest readings to ${iso(ds.dates[ds.n - 1])}`;
  $('#story').textContent = 'Projection uses the latest complete day of upstream readings and the lab result you enter.';
  $('#fc-weather').innerHTML = weatherHtml(ds.payload.nws);
  const kA = lastIndexWith(ds, ['flow', 'turb']);
  $('#fc-analogs').innerHTML = kA == null ? '<p class="note">No recent turbidity and flow readings.</p>'
    : `<p class="note">Based on ${iso(ds.dates[kA])}, the latest day with both readings.</p>` + analogsHtml(analogs(ds, kA, false));
  runForecast();
}
function runForecast() {
  const ds = live;
  if (!ds) return;
  const need = ['flow', 'turb', 'cond', 'ph', 'temp', 'swe'];
  const k = lastIndexWith(ds, need);
  if (k == null || k < 3) { $('#fc-basis').textContent = 'Upstream readings are incomplete in the live window; cannot project.'; return; }
  const priors = { toc: parseFloat($('#fc-toc').value), alk: parseFloat($('#fc-alk').value) };
  for (const t of ['toc', 'alk']) if (!Number.isFinite(priors[t])) priors[t] = null;
  const labMs = $('#fc-labdate').value ? parseDay($('#fc-labdate').value) : null;
  const stale = labMs != null ? Math.round((ds.dates[k] - labMs) / DAY) : null;
  const proj = project(ds, k, priors, 'allModel');
  $('#fc-basis').innerHTML = `Upstream readings from <b>${iso(ds.dates[k])}</b> (latest complete day). Day 0 is that day.
    ${stale != null && stale > 1 ? `<span class="pill warn">plant reading is ${stale} days older than the upstream readings</span> Operators sample twice a day, so this morning's value should be available. Type it in above.` : ''}`;
  const html = [], charts = $('#fc-charts');
  charts.innerHTML = '';
  for (const t of ['toc', 'alk']) {
    const lim = t === 'toc' ? T.constants.tocLimit : T.constants.alkLimit, d = t === 'toc' ? 2 : 1;
    const p = proj[t];
    const all = p.flatMap((r) => [r.hybrid, r.upstream, r.persistence, r.hybrid != null ? r.hybrid + 1.28 * r.rmse : null, r.hybrid != null ? r.hybrid - 1.28 * r.rmse : null]).filter((v) => v != null).concat([lim]);
    const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.1 || 1;
    const start = priors[t];
    const box = document.createElement('div');
    box.innerHTML = `<b>${t === 'toc' ? 'TOC' : 'Alkalinity'} (mg/L)</b>` + legend([['#fff', 'hybrid ± rough 80% band', false, 'fc:hybrid'], ['#f0b429', 'upstream-only', true, 'fc:upstream'], ['#8ea2b4', 'persistence', true, 'fc:persistence']]);
    box.appendChild(xyChart({
      width: 620, height: 210, xDomain: [0, 7], yDomain: [lo - pad, hi + pad], xTicks: range(0, 7), xFmt: (v) => (v ? '+' + v + ' d' : 'day 0'), yFmt: (v) => fmt(v, d),
      bands: [{ points: p.filter((r) => r.hybrid != null).map((r) => [r.h, r.hybrid - 1.28 * r.rmse, r.hybrid + 1.28 * r.rmse]), color: '#fff', key: 'fc:hybrid' }],
      vbands: [{ x0: DECISION_H - 0.5, x1: DECISION_H + 0.5, label: 'action window' }],
      hlines: [{ y: lim, label: t === 'toc' ? 'TOC 3 mg/L' : 'alkalinity 60 mg/L' }],
      series: [
        { points: [[0, start], ...p.map((r) => [r.h, r.hybrid])], color: '#fff', dots: true, label: 'hybrid', key: 'fc:hybrid' },
        { points: p.map((r) => [r.h, r.upstream]), color: '#f0b429', dash: '5 3', dots: true, r: 2, label: 'upstream-only', key: 'fc:upstream' },
        { points: [[0, start], ...p.map((r) => [r.h, r.persistence])], color: '#8ea2b4', dash: '2 3', label: 'persistence', key: 'fc:persistence' },
      ],
    }));
    charts.appendChild(box);
    const flags = p.filter((r) => r.hybrid != null && (t === 'toc' ? r.hybrid > lim : r.hybrid < lim)).map((r) => '+' + r.h + 'd');
    html.push(`<p><b>${t === 'toc' ? 'TOC' : 'Alkalinity'}</b>: ${flags.length ? `<span class="pill ${t === 'toc' ? 'bad' : 'warn'}">hybrid ${t === 'toc' ? 'above 3' : 'below 60'} on ${flags.join(', ')}</span>` : '<span class="pill ok">hybrid stays on the right side of the threshold</span>'}</p>
      <table><tr><th>date</th><th>hybrid</th><th>upstream-only</th><th>persistence</th><th>test RMSE</th></tr>
      ${p.map((r) => `<tr${r.h === DECISION_H ? ' class="decision"' : ''}><td>${iso(r.ms)} (+${r.h})</td><td>${fmt(r.hybrid, d)}</td><td>${fmt(r.upstream, d)}</td><td>${fmt(r.persistence, d)}</td><td>${fmt(r.rmse, d)}</td></tr>`).join('')}</table>`);
  }
  $('#fc-table').innerHTML = html.join('');
  $('#fc-caveats').innerHTML = caveats().map((c) => `<li>${c}</li>`).join('');
}
function caveats() {
  const out = [];
  for (const t of ['toc', 'alk']) {
    const name = t === 'toc' ? 'TOC' : 'alkalinity';
    const hz = T.models[t].horizons;
    const wins = hz.filter((h) => h.hybrid.test.rmse < h.persistence.test.rmse).map((h) => h.h);
    const up = hz.map((h) => h.upstream.test.r2);
    out.push(`${name}: the hybrid beats persistence on test RMSE at ${wins.length ? '+' + wins.join(', +') + ' d' : 'no horizon'}.
      Upstream-only test R² runs ${fmt(Math.min(...up), 2)} to ${fmt(Math.max(...up), 2)}. These are linear models; Jake's forests do better (guide.md §10).`);
  }
  out.push('Operators measure TOC and alkalinity at the plant twice a day (Jake, 2026-09-25). So persistence is the baseline an operator already has, and a fair one to beat.');
  out.push('Strontia has 4 gates at different heights (Jake). Which one is drawing changes what reaches the plant, and that isn\'t an input here. See Reservoir depth.');
  out.push('Reservoir releases from Cheesman and Strontia are not an input. What reaches the plant is partly an operator\'s decision (register Q14).');
  out.push('Forecast rain is shown, not modelled. A storm like 2023-08-01 appears in the inputs only once it reaches the gage.');
  out.push('The band is ±1.28 × test RMSE, a rough spread that assumes normal errors. It is not a calibrated interval.');
  out.push('Upstream readings are provisional (USGS, DWR, NRCS). Denver Water\'s data terms apply to anything derived from this.');
  return out;
}

// ---------- heads-up from analog days ----------
function analogs(ds, k, excludeNearby) {
  const H = DECISION_H;
  const x = modelInputs(ds, k, ds.dates[k], null);
  if (x.dLogTurbFlow3 == null) return { reason: 'it needs turbidity and flow today and 3 days earlier' };
  const month = new Date(ds.dates[k]).getUTCMonth();
  const matches = [];
  for (let j = 3; j < hist.n - H; j++) {
    if (excludeNearby && Math.abs(j - k) <= 14) continue;
    const md = Math.abs(new Date(hist.dates[j]).getUTCMonth() - month);
    if (Math.min(md, 12 - md) > 1) continue;
    const y = modelInputs(hist, j, hist.dates[j], null);
    if (y.dLogTurbFlow3 == null || Math.abs(y.dLogTurbFlow3 - x.dLogTurbFlow3) > 0.25) continue;
    const t0 = hist.series.toc[j], t4 = hist.series.toc[j + H];
    if (t0 == null || t4 == null) continue;
    let over = false;
    for (let q = j + 1; q <= j + H; q++) if (hist.series.toc[q] > T.constants.tocLimit) over = true;
    const a0 = hist.series.alk[j], a4 = hist.series.alk[j + H];
    matches.push({ j, dToc: t4 - t0, dAlk: a0 != null && a4 != null ? a4 - a0 : null, over });
  }
  return { change: Math.expm1(x.dLogTurbFlow3), matches };
}
function analogsHtml(res) {
  if (res.reason) return `<p class="note">No heads-up: ${res.reason}.</p>`;
  const m = res.matches, H = DECISION_H;
  const s = (v, d) => (v == null ? '—' : (v >= 0 ? '+' : '') + fmt(v, d));
  const head = `Turbidity × flow has changed <b>${s(100 * res.change, 0)}%</b> over the last 3 days.`;
  if (m.length < 5) return `<p>${head}</p><p class="note">${m.length ? `Only ${m.length} past day${m.length > 1 ? 's' : ''}` : 'No past day'} at this time of year had a change this size. That's too few to say what follows, and the rarity is itself worth noticing.</p>`;
  const toc = m.map((r) => r.dToc).sort((a, b) => a - b), alk = m.map((r) => r.dAlk).filter((v) => v != null).sort((a, b) => a - b);
  const over = m.filter((r) => r.over).length;
  return `<p>${head}</p>
    <p>On <b>${m.length}</b> past days at this time of year with a similar change, plant TOC ${H} days later moved by a median of <b>${s(quantile(toc, 0.5), 2)} mg/L</b>
    (10th–90th percentile ${s(quantile(toc, 0.1), 2)} to ${s(quantile(toc, 0.9), 2)}), and alkalinity by ${s(quantile(alk, 0.5), 1)} mg/L.
    TOC went above 3 within ${H} days on <b>${over}</b> of them.</p>
    <p class="note">Similar = 3-day change in log(1 + turbidity × flow) within ±0.25, within a month of the same time of year. Neighbouring days overlap, so these aren't ${m.length} independent events. No dosing advice is implied.</p>`;
}

// ---------- reservoir depth ----------
const VIRIDIS = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
const GATE_COLORS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0'];
function viridis(f) {
  f = Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0));
  const p = f * (VIRIDIS.length - 1), i = Math.min(VIRIDIS.length - 2, Math.floor(p)), t = p - i;
  return `rgb(${VIRIDIS[i].map((v, k) => Math.round(v + (VIRIDIS[i + 1][k] - v) * t)).join(',')})`;
}
const M_TO_FT = 3.28084;
const ft = (m) => Math.round(m * M_TO_FT);
function gateFeet() { return [0, 1, 2, 3].map((k) => Math.max(0, +$('#gate' + k).value || 0)); }
// Gates are entered in feet; the sonde grid is in 1 m bins, so convert to a bin index.
function gateDepths() {
  const max = T.sonde.depths.length - 1;
  return gateFeet().map((f) => Math.max(0, Math.min(max, Math.floor(f / M_TO_FT))));
}
function sondeAt(grid, d, depth) {
  const row = grid[d];
  if (!row) return null;
  for (const off of [0, -1, 1]) if (row[depth + off] != null) return row[depth + off];
  return null;
}
function sondeDay(ms) { return Math.round((ms - parseDay(T.sonde.start)) / DAY); }
function topBottom(d) {
  const row = T.sonde.params.temp.grid[d];
  if (!row) return null;
  const top = row.slice(0, 3).find((v) => v != null);
  let bottom = null;
  for (let z = row.length - 1; z >= 35; z--) if (row[z] != null) { bottom = row[z]; break; }
  return top != null && bottom != null ? { top, bottom } : null;
}
function sondeLine(ms) {
  const tb = topBottom(sondeDay(ms));
  return tb ? `sonde: ${fmt(tb.top)} °C top, ${fmt(tb.bottom)} °C bottom` : '';
}
function renderDepth() {
  const S = T.sonde, key = $('#dp-param').value || 'turb', P = S.params[key];
  const nDays = P.grid.length, nDepth = S.depths.length, start = parseDay(S.start);
  const gates = gateDepths();
  const tr = P.log ? (v) => Math.log10(Math.max(v, 0.05)) : (v) => v;
  const all = P.grid.flat().filter((v) => v != null).map(tr).sort((a, b) => a - b);
  const lo = quantile(all, 0.02), hi = quantile(all, 0.98);
  const unit = P.unit ? ` (${P.unit})` : '';
  $('#dp-note').innerHTML = `${P.label}${unit}${P.log ? ', log colour scale' : ''}: daily median per 1 m (3.3 ft) depth bin, from ${S.nReadings.toLocaleString()} readings on ${S.daysWithData} days (${S.start} to ${S.end}).
    Grey = no reading. Dashed lines are the four gates. The bars on top are the daily maximum river turbidity at the gage above Strontia, for the same days.`;

  const W = 900, L = 44, R = 90, top = 46, H = 300, B = 44;
  const svg = el('svg', { width: '100%', viewBox: `0 0 ${W} ${top + H + B}` });
  const cw = (W - L - R) / nDays, ch = H / nDepth;
  const x = (d) => L + d * cw, y = (z) => top + z * ch;
  const river = range(0, nDays - 1).map((d) => { const j = hist.index(start + d * DAY); return j >= 0 && j < hist.n ? hist.series.turbMax[j] : null; });
  const rmax = Math.max(1, ...river.filter((v) => v != null));
  river.forEach((v, d) => {
    if (v == null) return;
    const h = 32 * Math.log10(1 + v) / Math.log10(1 + rmax);
    el('rect', { x: x(d), y: top - 6 - h, width: Math.max(1, cw - 0.4), height: h, fill: turbColor(v) }, svg)
      .appendChild(Object.assign(document.createElementNS(SVGNS, 'title'), { textContent: `${iso(start + d * DAY)} river turbidity max ${fmt(v, 0)} FNU` }));
  });
  txt(svg, W - R + 6, top - 10, 'river turbidity');
  el('rect', { x: L, y: top, width: W - L - R, height: H, fill: '#2a2f36' }, svg);
  for (let d = 0; d < nDays; d++) {
    for (let z = 0; z < nDepth; z++) {
      const v = P.grid[d][z];
      if (v != null) el('rect', { x: x(d), y: y(z), width: cw + 0.4, height: ch + 0.4, fill: viridis((tr(v) - lo) / (hi - lo)) }, svg);
    }
  }
  for (let f = 0; f <= nDepth * M_TO_FT; f += 25) txt(svg, L - 4, top + (f / M_TO_FT) * ch + 4, f + ' ft', { 'text-anchor': 'end' });
  for (let d = 0; d < nDays; d++) {
    const dt = new Date(start + d * DAY);
    if (dt.getUTCDate() === 1) txt(svg, x(d), top + H + 16, dt.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }));
  }
  const feet = gateFeet();
  gates.forEach((g, k) => {
    el('line', { x1: L, x2: W - R, y1: y(g + 0.5), y2: y(g + 0.5), stroke: GATE_COLORS[k], 'stroke-dasharray': '5 3', 'stroke-width': 1.5 }, svg);
    txt(svg, W - R + 6, y(g + 0.5) + 4, `G${k + 1} ${feet[k]} ft`, { fill: GATE_COLORS[k] });
  });
  // colour legend
  for (let k = 0; k < 5; k++) {
    const f = k / 4, v = lo + f * (hi - lo), lx = W - R - 5 * 58 + k * 58;
    el('rect', { x: lx, y: top + H + 24, width: 12, height: 12, fill: viridis(f) }, svg);
    txt(svg, lx + 16, top + H + 34, fmt(P.log ? 10 ** v : v, 1));
  }
  const hit = el('rect', { x: L, y: top, width: W - L - R, height: H, fill: 'transparent', style: 'cursor:crosshair' }, svg);
  hit.addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * (W / r.width), sy = (e.clientY - r.top) * ((top + H + B) / r.height);
    const d = Math.floor((sx - L) / cw), z = Math.floor((sy - top) / ch);
    if (d < 0 || d >= nDays || z < 0 || z >= nDepth) return hideTip();
    showTip(e, `<b>${iso(start + d * DAY)}</b>, ${ft(z)}–${ft(z + 1)} ft<br>${P.label}: ${fmt(P.grid[d][z], 2)} ${P.unit}`);
  });
  hit.addEventListener('mouseleave', hideTip);
  $('#dp-heat').innerHTML = '';
  $('#dp-heat').appendChild(svg);

  // per-gate series
  const perGate = gates.map((g) => range(0, nDays - 1).map((d) => sondeAt(P.grid, d, g)));
  const vals = perGate.flat().filter((v) => v != null);
  const monthTicks = range(0, nDays - 1).filter((d) => new Date(start + d * DAY).getUTCDate() === 1);
  const box = $('#dp-gates');
  box.innerHTML = legend(gates.map((g, k) => [GATE_COLORS[k], `G${k + 1} at ${feet[k]} ft`, false, 'gate:' + k]));
  if (vals.length) {
    box.appendChild(xyChart({
      width: 900, height: 220, xDomain: [0, nDays - 1], yDomain: [Math.min(...vals), Math.max(...vals) * 1.02 || 1],
      xTicks: monthTicks, xFmt: (d) => new Date(start + d * DAY).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), yFmt: (v) => fmt(v, 1),
      series: perGate.map((pts, k) => ({ points: pts.map((v, d) => [d, v]), color: GATE_COLORS[k], width: 1.6, key: 'gate:' + k })), yLabel: P.unit,
    }));
  }

  // best gate
  const med = (arr) => { const s = arr.filter((v) => v != null).sort((a, b) => a - b); return s.length ? quantile(s, 0.5) : null; };
  const p90 = (arr) => { const s = arr.filter((v) => v != null).sort((a, b) => a - b); return s.length ? quantile(s, 0.9) : null; };
  let wins = [0, 0, 0, 0], compared = 0;
  if (P.better) {
    for (let d = 0; d < nDays; d++) {
      const v = perGate.map((s) => s[d]);
      if (v.some((u) => u == null)) continue;
      const best = v.indexOf(P.better === 'low' ? Math.min(...v) : Math.max(...v));
      wins[best]++; compared++;
    }
  }
  $('#dp-best').innerHTML = `<table><tr><th>gate</th><th>median</th><th>90th pct</th>${P.better ? '<th>best on</th>' : ''}</tr>
    ${gates.map((g, k) => `<tr><td><span style="color:${GATE_COLORS[k]}">G${k + 1}</span> ${feet[k]} ft</td><td>${fmt(med(perGate[k]), 2)}</td><td>${fmt(p90(perGate[k]), 2)}</td>${P.better ? `<td>${wins[k]} d</td>` : ''}</tr>`).join('')}</table>
    <p class="note">${P.better ? `Best = ${P.better === 'low' ? 'lowest' : 'highest'} ${P.label.toLowerCase()} on each of the ${compared} days where all four gates have a reading.`
      : `No better-or-worse direction is assumed for ${P.label.toLowerCase()}. Pick turbidity, oxygen, chlorophyll or phycocyanin to see a "best gate".`}
    This is the "look at water quality by level" view Jake asked for. It doesn't recommend a gate.</p>`;

  // stratification
  const diff = range(0, nDays - 1).map((d) => { const tb = topBottom(d); return tb ? tb.top - tb.bottom : null; });
  const last = [...diff.keys()].reverse().find((d) => diff[d] != null);
  const sb = $('#dp-strat');
  sb.innerHTML = `<p class="note">Surface (top ~10 ft) temperature minus the deepest reading below ~115 ft. A fully mixed column has a difference near zero (general knowledge). Turnover shows up as the gap collapsing.</p>`;
  sb.appendChild(xyChart({
    width: 360, height: 170, xDomain: [0, nDays - 1], yDomain: [0, Math.max(1, ...diff.filter((v) => v != null)) * 1.1],
    xTicks: monthTicks, xFmt: (d) => new Date(start + d * DAY).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), yFmt: (v) => fmt(v, 0),
    series: [{ points: diff.map((v, d) => [d, v]), color: '#ff6b9a' }], yLabel: '°C',
  }));
  if (last != null) sb.insertAdjacentHTML('beforeend', `<p class="note">Last reading ${iso(start + last * DAY)}: ${fmt(diff[last])} °C top-to-bottom. Compare with near zero for a mixed column; data after ${S.end} would be needed to see turnover (Q18).</p>`);
  renderWhatIf();
}

// ---------- gate what-if ----------
function whatIf(target, zGate) {
  const G = T.gate, M = G.targets[target], S = T.sonde, start = parseDay(S.start);
  const n = S.params.sc.grid.length, zOpen = G.openBin;
  const rows = [];
  for (let k = 0; k < n; k++) {
    const ms = start + (k + M.lag) * DAY, j = hist.index(ms);
    const actual = j >= 0 && j < hist.n ? hist.series[target][j] : null;
    const deltas = M.features.map((f) => {
      const a = sondeAt(S.params[f].grid, k, zGate), b = sondeAt(S.params[f].grid, k, zOpen);
      return a != null && b != null ? a - b : null;
    });
    if (actual == null || deltas.some((d) => d == null)) { rows.push({ ms, actual, v: null }); continue; }
    const shift = (beta) => beta.reduce((acc, b, q) => acc + b * deltas[q], 0);
    const boots = M.bootstrap.map((b) => actual + shift(b)).sort((a, b) => a - b);
    const extrap = M.features.some((f, q) => Math.abs(deltas[q]) > M.typicalSwing[f]);
    rows.push({ ms, actual, v: actual + shift(M.beta), lo: quantile(boots, 0.1), hi: quantile(boots, 0.9), extrap });
  }
  return rows;
}
function renderWhatIf() {
  if (!T.gate) return;
  const G = T.gate, feet = gateFeet(), bins = gateDepths(), S = T.sonde, start = parseDay(S.start);
  const openFt = G.openGateFt;
  const sel = $('#wf-gate');
  const prev = sel.value;
  sel.innerHTML = feet.map((f, k) => `<option value="${k}"${bins[k] === G.openBin ? ' disabled' : ''}>G${k + 1} at ${f} ft${bins[k] === G.openBin ? ' (open now)' : ''}</option>`).join('');
  const firstOther = bins.findIndex((z) => z !== G.openBin);
  sel.value = prev !== '' && bins[+prev] !== G.openBin && sel.querySelector(`option[value="${prev}"]`) ? prev : String(Math.max(0, firstOther));
  const k = +sel.value, zGate = bins[k];
  const ta = G.targets.alk, tt = G.targets.toc;
  $('#wf-intro').innerHTML = `Everything Foothills measured came through the <b>${openFt} ft gate</b>. The dark line is what the plant actually measured. The coloured line estimates what it would have measured drawing from <b>G${k + 1} at ${feet[k]} ft</b> instead. Shading is a rough 80% range from resampling the fit.`;

  const box = $('#wf-charts');
  box.innerHTML = '';
  const nDays = S.params.sc.grid.length;
  const monthTicks = range(0, nDays).filter((d) => new Date(start + d * DAY).getUTCDate() === 1);
  const summary = {};
  for (const target of ['toc', 'alk']) {
    const rows = whatIf(target, zGate), lim = target === 'toc' ? T.constants.tocLimit : T.constants.alkLimit, d = target === 'toc' ? 2 : 1;
    const xs = (r) => (r.ms - start) / DAY;
    const vals = rows.flatMap((r) => [r.actual, r.lo, r.hi]).filter((v) => v != null).concat([lim]);
    const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.08;
    const runs = [];
    for (const r of rows) {
      if (r.v == null) { runs.push([]); continue; }
      if (!runs.length) runs.push([]);
      runs[runs.length - 1].push([xs(r), r.lo, r.hi]);
    }
    const div = document.createElement('div');
    div.innerHTML = `<b>${target === 'toc' ? 'TOC' : 'Alkalinity'} at Foothills (mg/L)</b>` +
      legend([['#dbe5ee', `measured (${openFt} ft gate)`, false, 'wf:measured'], [GATE_COLORS[k], `what-if: G${k + 1} ${feet[k]} ft`, false, 'wf:whatif'], ['var(--warn)', 'what-if outside the fitted range', false, 'wf:extrap']]);
    div.appendChild(xyChart({
      width: 900, height: 220, xDomain: [0, nDays + 1], yDomain: [lo - pad, hi + pad], xTicks: monthTicks,
      xFmt: (x) => new Date(start + x * DAY).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), yFmt: (v) => fmt(v, d),
      bands: runs.filter((pts) => pts.length > 1).map((pts) => ({ points: pts, color: GATE_COLORS[k], key: 'wf:whatif' })),
      hlines: [{ y: lim, label: target === 'toc' ? 'TOC 3' : 'alkalinity 60' }],
      series: [
        { points: rows.map((r) => [xs(r), r.actual]), color: '#dbe5ee', width: 1.4, key: 'wf:measured' },
        { points: rows.map((r) => [xs(r), r.v]), color: GATE_COLORS[k], width: 1.8, key: 'wf:whatif' },
        { points: rows.filter((r) => r.extrap).map((r) => [xs(r), r.v]), color: 'var(--warn)', width: 0, dots: true, r: 2.5, label: 'outside fitted range', key: 'wf:extrap' },
      ],
    }));
    box.appendChild(div);
  }

  // all gates table
  const stat = (target, z) => {
    const rows = whatIf(target, z).filter((r) => r.v != null);
    const diffs = rows.map((r) => r.v - r.actual).sort((a, b) => a - b);
    const over = (v) => (target === 'toc' ? v > T.constants.tocLimit : v < T.constants.alkLimit);
    return { n: rows.length, med: quantile(diffs, 0.5), actualDays: rows.filter((r) => over(r.actual)).length,
      whatIfDays: rows.filter((r) => over(r.v)).length, extrap: rows.filter((r) => r.extrap).length };
  };
  const s = (v, dd) => (v == null ? '—' : (v >= 0 ? '+' : '') + fmt(v, dd));
  $('#wf-table').innerHTML = `<table><tr><th>gate</th><th>ΔTOC</th><th>TOC&gt;3 days</th><th>Δalk</th><th>alk&lt;60 days</th><th>outside fit</th></tr>
    ${bins.map((z, q) => {
      if (z === G.openBin) return `<tr><td><span style="color:${GATE_COLORS[q]}">G${q + 1}</span> ${feet[q]} ft</td><td colspan="5" class="l">open now: measured</td></tr>`;
      const a = stat('toc', z), b = stat('alk', z);
      return `<tr><td><span style="color:${GATE_COLORS[q]}">G${q + 1}</span> ${feet[q]} ft</td><td>${s(a.med, 2)}</td><td>${a.actualDays}→${a.whatIfDays}</td><td>${s(b.med, 1)}</td><td>${b.actualDays}→${b.whatIfDays}</td><td>${fmt(100 * Math.max(a.extrap, b.extrap) / Math.max(1, a.n), 0)}%</td></tr>`;
    }).join('')}</table>
    <p class="note">Δ = median daily change against what was measured. "3→5" = days over the threshold, measured → what-if. "Outside fit" = share of days where the gate-to-gate difference is bigger than the day-to-day swings the model learned from, so the estimate is extrapolating.</p>`;

  // evidence by depth
  const ev = $('#wf-evidence');
  ev.innerHTML = `<p class="note">Short-term (trend-removed) correlation between plant alkalinity and computed specific conductance at each depth,
    and between plant TOC and turbidity at each depth. If the plant draws at ${openFt} ft, the peak should be near there.</p>`;
  const depthsFt = S.depths.map((z) => (z + 0.5) * M_TO_FT);
  const r1 = ta.evidenceByDepth, r2 = tt.evidenceByDepth;
  const pk = (r) => { let b = null; r.forEach((v, z) => { if (v != null && (b == null || v > r[b])) b = z; }); return b; };
  ev.appendChild(xyChart({
    width: 360, height: 200, xDomain: [0, 160], yDomain: [-0.2, 0.7], xTicks: [0, 40, 80, 120, 160], yTicks: [-0.2, 0, 0.2, 0.4, 0.6],
    xFmt: (v) => v + ' ft', yFmt: (v) => fmt(v, 1),
    vbands: [{ x0: openFt - 3, x1: openFt + 3, color: '#fff', label: `${openFt} ft` }],
    series: [
      { points: r1.map((v, z) => [depthsFt[z], v]), color: '#b48cff', label: 'alk vs SC', key: 'ev:alk' },
      { points: r2.map((v, z) => [depthsFt[z], v]), color: '#d9a866', label: 'TOC vs turbidity', key: 'ev:toc' },
    ],
  }));
  const p1 = pk(r1), p2 = pk(r2);
  ev.insertAdjacentHTML('beforeend', legend([['#b48cff', 'alkalinity vs conductance', false, 'ev:alk'], ['#d9a866', 'TOC vs turbidity', false, 'ev:toc']]) +
    `<p class="note">Strongest at about ${fmt(depthsFt[p1], 0)} ft (alkalinity) and ${fmt(depthsFt[p2], 0)} ft (TOC). ${Math.abs(depthsFt[p1] - openFt) < 25 ? 'That is consistent with a 45 ft draw.' : 'That is not obviously a 45 ft signal, so treat the what-if with extra caution.'}
    The curves are broad, because layers near each other carry similar water.</p>`);

  $('#wf-method').innerHTML = [
    `Start from what the plant actually measured, since that water came through the ${openFt} ft gate.`,
    `For each day, take the difference between the other gate and ${openFt} ft in the sonde readings, then shift the measured value by that difference × a fitted slope.`,
    `Alkalinity uses computed specific conductance (slope ${fmt(ta.beta[0], 3)} mg/L per µS/cm, ${ta.lag} d later, detrended R² ${fmt(ta.r2Detrended, 2)}, n=${ta.n}). The river gage gives an independent slope of about 0.19 on four years of data.`,
    `TOC uses turbidity and conductance (slopes ${tt.beta.map((b, q) => `${tt.features[q]} ${fmt(b, 4)}`).join(', ')}; ${tt.lag} d later, detrended R² ${fmt(tt.r2Detrended, 2)}, n=${tt.n}).`,
    `Slopes are fitted on short-term swings (${G.detrendDays}-day moving mean removed) so the spring-to-summer drift can't masquerade as a depth effect. Temperature is left out deliberately: shallow water is warmer from the sun, not because it is different water.`,
    `Specific conductance = raw conductivity / (1 + ${G.scAlpha} × (T − 25)), the standard compensation (general knowledge). The raw sonde column is uncompensated.`,
    'Not captured: TOC the sonde can\'t see (no organic-matter sensor yet), mixing inside the intake tower, how a different draw would change the reservoir itself, and the treatment consequences. Denver Water should validate this with a real gate change.',
  ].map((t) => `<li>${t}</li>`).join('');
}

// ---------- years ----------
function renderYears() {
  const key = $('#yr-var').value || 'swe';
  const lane = LANES.find((l) => l.key === key);
  const byWY = {};
  hist.dates.forEach((ms, j) => { const wy = waterYear(ms); (byWY[wy] ||= []).push([dayOfWY(ms), hist.series[key][j]]); });
  const vals = Object.values(byWY).flat().map((p) => p[1]).filter((v) => v != null);
  const years = [...new Set([...Object.keys(byWY), ...Object.keys(T.years.labels)])].sort();
  const series = Object.entries(byWY).map(([wy, pts]) => ({ points: pts, color: yearColor(wy, years), width: wy == 2026 ? 2.4 : 1.5, label: 'WY' + wy, key: 'yr:' + wy }));
  if (key === 'swe') series.unshift({ points: T.years.medianTrace.map((v, j) => [j, v]), color: '#fff', dash: '3 3', width: 1, label: 'median', key: 'yr:median' });
  const hi = Math.max(...vals, ...(key === 'swe' ? T.years.medianTrace.filter((v) => v != null) : []));
  const lo = lane.bars || key === 'swe' ? 0 : Math.min(...vals);
  const monthStarts = [0, 31, 61, 92, 123, 151, 182, 212, 243, 273, 304, 335];
  const box = $('#yr-chart');
  box.innerHTML = `<b>${lane.label}</b> <span class="note">${lane.unit}</span>` +
    legend([...Object.keys(byWY).map((wy) => [yearColor(wy, years), `WY${wy}${T.years.labels[wy] ? ` (${T.years.labels[wy].label})` : ''}`, false, 'yr:' + wy]), ...(key === 'swe' ? [['#fff', `Hoosier Pass median ${T.years.firstYear}–${T.years.lastYear}`, true, 'yr:median']] : [])]);
  box.appendChild(xyChart({
    width: 900, height: 360, xDomain: [0, 365], yDomain: [lo, hi * 1.05], xTicks: monthStarts,
    xFmt: (v) => ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][monthStarts.indexOf(v)] || '',
    yFmt: (v) => fmt(v, hi > 100 ? 0 : 1), series,
    hlines: lane.threshold != null ? [{ y: lane.threshold, label: String(lane.threshold) }] : [],
  }));
  const labels = T.years.labels;
  $('#yr-table').innerHTML = `<p class="note">${T.years.rule} Tercile bounds: dry below ${T.years.terciles[0]} in, wet above ${T.years.terciles[1]} in, from ${T.years.nYears} years (${T.years.firstYear}–${T.years.lastYear}).</p>
    <table><tr><th>water year</th><th>peak SWE</th><th>% median</th><th>label</th></tr>
    ${Object.entries(labels).map(([wy, v]) => `<tr><td><i class="swatch" style="background:${yearColor(wy, years)}"></i>WY${wy}${wy == 2022 ? ' <span class="note">(data from Apr 1)</span>' : ''}</td><td>${fmt(v.peak)}</td><td>${fmt(v.pctMedian, 0)}%</td><td>${v.label}</td></tr>`).join('')}</table>
    <p class="note">Four of five years come out dry against the long record. That may be true, or it may mean one pillow is a poor proxy for the basin (Q17). Ask Denver Water for their own rule (Q16).</p>`;
  const peaks = Object.entries(T.years.allPeaks).map(([wy, v]) => [+wy, v]);
  const pb = $('#yr-peaks');
  pb.innerHTML = '';
  pb.appendChild(xyChart({
    width: 360, height: 200, xDomain: [peaks[0][0] - 1, peaks[peaks.length - 1][0] + 1], yDomain: [0, Math.max(...peaks.map((p) => p[1])) * 1.08],
    xTicks: niceTicks(peaks[0][0], peaks[peaks.length - 1][0], 4), xFmt: (v) => String(v), yFmt: (v) => fmt(v, 0),
    bars: peaks.map(([wy, v]) => ({ x: wy, y: v, w: 5, title: `WY${wy}: ${v} in`, color: years.includes(String(wy)) ? yearColor(wy, years) : '#4a5866' })),
    hlines: [{ y: T.years.terciles[0], color: '#9aa8b5', label: 'dry below' }, { y: T.years.terciles[1], color: '#9aa8b5', label: 'wet above' }], yLabel: 'in',
  }));
}

// ---------- lags & skill ----------
function renderLags() {
  const target = $('#lag-target').value, season = $('#lag-season').value;
  const block = T.lags[target][season];
  const feats = Object.keys(block);
  const box = $('#lag-chart');
  box.innerHTML = legend(feats.map((f) => [FEATURE_COLORS[f], FEATURE_NAMES[f], false, 'lag:' + f]));
  box.appendChild(xyChart({
    width: 560, height: 280, xDomain: [0, 10], yDomain: [-1, 1], xTicks: range(0, 10), yTicks: [-1, -0.5, 0, 0.5, 1],
    xFmt: (v) => v + ' d', yFmt: (v) => fmt(v, 1), xLabel: 'upstream reading this many days before the lab sample', yLabel: 'ρ',
    series: feats.map((f) => ({ points: block[f].rho.map((r, j) => [j, r]), color: FEATURE_COLORS[f], dots: true, r: 2, label: FEATURE_NAMES[f], key: 'lag:' + f })),
    hlines: [{ y: 0, color: '#556' }],
  }));
  const rows = feats.map((f) => ({ f, ...bestLag(target, season, f) })).sort((a, b) => Math.abs(b.rho ?? 0) - Math.abs(a.rho ?? 0));
  $('#lag-table').innerHTML = `<table><tr><th>upstream signal</th><th>strongest at</th><th>ρ</th><th>days (n)</th></tr>
    ${rows.map((r) => `<tr><td>${FEATURE_NAMES[r.f]}</td><td>${r.lag} d</td><td>${fmt(r.rho, 2)}</td><td>${r.n}</td></tr>`).join('')}</table>
    <p class="note">Correlation, not cause. Seasons are our split. Flow against TOC is register Q15: compare its sign across seasons.</p>`;
  renderSkill();
}
function renderSkill() {
  const box = $('#skill-chart');
  box.innerHTML = legend([['#fff', 'hybrid', false, 'sk:hybrid'], ['#f0b429', 'upstream-only', false, 'sk:upstream'], ['#8ea2b4', 'persistence', false, 'sk:persistence']]);
  const text = [];
  for (const t of ['toc', 'alk']) {
    const hz = T.models[t].horizons, d = t === 'toc' ? 2 : 1;
    const pts = (v) => hz.map((h) => [h.h, h[v].test.rmse]);
    const all = hz.flatMap((h) => [h.hybrid.test.rmse, h.upstream.test.rmse, h.persistence.test.rmse]);
    const title = document.createElement('div');
    title.innerHTML = `<b>${t === 'toc' ? 'TOC' : 'Alkalinity'}</b> <span class="note">test RMSE, mg/L (lower is better) · test from ${T.models[t].splitDate}</span>`;
    box.appendChild(title);
    box.appendChild(xyChart({
      width: 560, height: 190, xDomain: [1, 7], yDomain: [0, Math.max(...all) * 1.1], xTicks: range(1, 7), xFmt: (v) => '+' + v + ' d', yFmt: (v) => fmt(v, d),
      series: [
        { points: pts('hybrid'), color: '#fff', dots: true, label: 'hybrid', key: 'sk:hybrid' },
        { points: pts('upstream'), color: '#f0b429', dots: true, dash: '5 3', label: 'upstream-only', key: 'sk:upstream' },
        { points: pts('persistence'), color: '#8ea2b4', dots: true, dash: '2 3', label: 'persistence', key: 'sk:persistence' },
      ],
      vbands: [{ x0: DECISION_H - 0.4, x1: DECISION_H + 0.4, label: 'action window' }],
    }));
    const h3 = hz[DECISION_H - 1];
    text.push(`<b>${t === 'toc' ? 'TOC' : 'Alkalinity'}, ${DECISION_H} days ahead:</b> hybrid RMSE ${fmt(h3.hybrid.test.rmse, d)} (R² ${fmt(h3.hybrid.test.r2, 2)}),
      persistence ${fmt(h3.persistence.test.rmse, d)} (R² ${fmt(h3.persistence.test.r2, 2)}), upstream-only ${fmt(h3.upstream.test.rmse, d)} (R² ${fmt(h3.upstream.test.r2, 2)}), n=${h3.hybrid.test.n}.`);
  }
  const winsAt = (t) => T.models[t].horizons.filter((h) => h.hybrid.test.rmse < h.persistence.test.rmse).map((h) => '+' + h.h);
  const wl = (t) => (winsAt(t).length ? `only at ${winsAt(t).join(', ')} d` : 'at no horizon');
  text.push(`What this says: operators already get plant TOC and alkalinity twice a day (Jake), so persistence is what they have now. A model earns its place only by beating it at the ${DECISION_H}-day window Jake named. The hybrid beats it for TOC ${wl('toc')}, and for alkalinity ${wl('alk')}. A river-only soft sensor doesn't come close. The useful product with this data is "what changed upstream since this morning's reading" (the heads-up card), not a new number. Jake's upcoming fluorescence organic-matter sensor is the input most likely to change that.`);
  $('#skill-text').innerHTML = text.map((s) => `<p>${s}</p>`).join('');
}

// ---------- modes ----------
async function setMode(mode) {
  state.mode = mode;
  if (state.playing) togglePlay();
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  for (const m of ['replay', 'live', 'forecast', 'depth', 'years', 'lags']) $('#view-' + m).classList.toggle('hidden', m !== mode);
  $('#journey-wrap').classList.toggle('hidden', ['years', 'lags', 'depth'].includes(mode));
  if (mode === 'replay') renderReplay();
  if (mode === 'live') await renderLive();
  if (mode === 'forecast') await renderForecast();
  if (mode === 'depth') renderDepth();
  if (mode === 'years') renderYears();
  if (mode === 'lags') renderLags();
}

async function init() {
  T = await (await fetch('data/twin.json')).json();
  hist = makeDataset(T.daily, ALL_KEYS);
  for (const k of ALL_KEYS) sorted[k] = hist.series[k].filter((v) => v != null).sort((a, b) => a - b);
  $('#scrub').max = hist.n - 1;
  $('#yr-var').innerHTML = LANES.map((l) => `<option value="${l.key}">${l.label}</option>`).join('');
  $('#lag-season').innerHTML = Object.keys(T.lags.toc).map((s) => `<option>${s}</option>`).join('');
  $('#dp-param').innerHTML = Object.entries(T.sonde.params).map(([k, p]) => `<option value="${k}"${k === 'turb' ? ' selected' : ''}>${p.label}</option>`).join('');
  $('#dp-param').addEventListener('change', renderDepth);
  document.querySelectorAll('input.gate').forEach((g) => g.addEventListener('change', renderDepth));
  $('#wf-gate').addEventListener('change', renderWhatIf);
  renderEvents();
  const hashDay = /^#\d{4}-\d{2}-\d{2}$/.test(location.hash) ? hist.index(parseDay(location.hash.slice(1))) : null;
  state.i = hashDay != null && hashDay >= 0 && hashDay < hist.n ? hashDay : hist.index(parseDay('2023-08-01'));

  document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $('#scrub').addEventListener('input', (e) => setDay(+e.target.value));
  $('#play').addEventListener('click', togglePlay);
  $('#speed').addEventListener('change', () => { if (state.playing) { togglePlay(); togglePlay(); } });
  $('#window').addEventListener('change', (e) => { state.window = +e.target.value; renderReplay(); });
  for (const id of ['#turb-p', '#flow-p', '#gap']) $(id).addEventListener('input', () => { renderEvents(); renderReplay(); });
  $('#event-jump').addEventListener('change', (e) => { if (e.target.value !== '') setDay(state.events[+e.target.value].start); });
  $('#prev-event').addEventListener('click', () => { const ev = [...state.events].reverse().find((v) => v.start < state.i); if (ev) setDay(ev.start); });
  $('#next-event').addEventListener('click', () => { const ev = state.events.find((v) => v.start > state.i); if (ev) setDay(ev.start); });
  $('#live-refresh').addEventListener('click', async () => { await loadLive(true); renderLive(); });
  $('#fc-run').addEventListener('click', runForecast);
  $('#yr-var').addEventListener('change', renderYears);
  $('#lag-target').addEventListener('change', renderLags);
  $('#lag-season').addEventListener('change', renderLags);
  document.addEventListener('click', toggleSeries);
  window.addEventListener('resize', () => setMode(state.mode));
  document.addEventListener('keydown', (e) => {
    if (state.mode !== 'replay' || ['INPUT', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight') setDay(state.i + 1);
    if (e.key === 'ArrowLeft') setDay(state.i - 1);
  });
  setMode('replay');
  requestAnimationFrame(animate);
}
init();
