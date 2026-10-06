#!/usr/bin/env node
// control-site — agent-friendly CLI for driving, inspecting and verifying a website.
// Lives at <project>/.claude/skills/verify-site/control-site.mjs. Output is JSON on stdout.
// Run `node control-site.mjs help` or `node control-site.mjs help <command>`.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const DIR = path.dirname(SCRIPT);
const STATE = path.join(DIR, '.state');
const CONFIG_PATH = path.join(DIR, 'verify.config.json');

const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:3000',
  devCommand: 'npm run dev',
  root: '../../..',
  routes: ['/'],
  viewports: { mobile: [390, 844], tablet: [820, 1180], desktop: [1440, 900] },
  budgets: { lcpMs: 2500, cls: 0.1, tbtMs: 200, jsKb: 350, totalKb: 2000 },
};

// ---------------------------------------------------------------- utilities

class CliError extends Error {
  constructor(message, hint) { super(message); this.hint = hint; }
}

function out(obj) { process.stdout.write(JSON.stringify({ ok: true, ...obj }, null, 2) + '\n'); }

function fail(err) {
  const body = { ok: false, error: err.message || String(err) };
  if (err.hint) body.hint = err.hint;
  process.stdout.write(JSON.stringify(body, null, 2) + '\n');
  process.exit(1);
}

function loadConfig() {
  let user = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try { user = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
    catch (e) { throw new CliError(`verify.config.json is not valid JSON: ${e.message}`, `Fix ${CONFIG_PATH}`); }
  }
  const cfg = { ...DEFAULT_CONFIG, ...user, viewports: { ...DEFAULT_CONFIG.viewports, ...user.viewports }, budgets: { ...DEFAULT_CONFIG.budgets, ...user.budgets } };
  if (process.env.SITE_URL) cfg.baseUrl = process.env.SITE_URL;
  cfg.rootAbs = path.resolve(DIR, cfg.root);
  return cfg;
}

function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) flags[k] = v;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) flags[k] = argv[++i];
      else flags[k] = true;
    } else pos.push(a);
  }
  return { pos, flags };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ensureState = () => fs.mkdirSync(STATE, { recursive: true });
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const writeJson = (p, v) => { ensureState(); fs.writeFileSync(p, JSON.stringify(v, null, 2)); };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const kb = (b) => Math.round(b / 102.4) / 10;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };

async function loadPlaywright(cfg) {
  try { return await import('playwright'); } catch {}
  for (const base of [cfg.rootAbs, process.cwd()]) {
    try {
      const req = createRequire(path.join(base, 'package.json'));
      return await import(pathToFileURL(req.resolve('playwright')).href);
    } catch {}
  }
  throw new CliError('playwright is not installed in this project.', 'Run: npm i -D playwright && npx playwright install chromium');
}

function resolveUrl(cfg, target) {
  if (!target) return cfg.baseUrl;
  if (/^https?:\/\//.test(target)) return target;
  return new URL(target, cfg.baseUrl.endsWith('/') ? cfg.baseUrl : cfg.baseUrl + '/').href.replace(/([^:]\/)\/+/g, '$1');
}

function resolveViewport(cfg, v) {
  if (!v) return null;
  if (cfg.viewports[v]) { const [width, height] = cfg.viewports[v]; return { width, height }; }
  const m = /^(\d+)x(\d+)$/.exec(v);
  if (m) return { width: +m[1], height: +m[2] };
  throw new CliError(`Unknown viewport "${v}".`, `Use one of: ${Object.keys(cfg.viewports).join(', ')}, or WIDTHxHEIGHT like 1280x800.`);
}

async function reachable(url, timeoutMs = 3000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'manual' });
    clearTimeout(t);
    return { up: true, status: res.status };
  } catch (e) { return { up: false, error: e.cause?.code || e.name }; }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
    srv.on('error', reject);
  });
}

async function requireSite(cfg, url) {
  const r = await reachable(url);
  if (!r.up) throw new CliError(`Site not reachable at ${url} (${r.error}).`, `Start it with: node ${path.relative(process.cwd(), SCRIPT)} dev up   (runs "${cfg.devCommand}")`);
}

// ---------------------------------------------------------------- in-page scripts

const VITALS_INIT = `(() => {
  const v = window.__vitals = { lcp: 0, lcpEl: null, cls: 0, longTasks: 0, tbt: 0 };
  const desc = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '') : null;
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { v.lcp = e.startTime; v.lcpEl = desc(e.element); } }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { v.longTasks++; v.tbt += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true }); } catch {}
})();`;

function readVitals() {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  const res = performance.getEntriesByType('resource');
  const bytes = { script: 0, css: 0, img: 0, font: 0, other: 0 };
  for (const r of res) {
    const t = r.initiatorType === 'script' ? 'script'
      : (r.initiatorType === 'link' && /\.css(\?|$)/.test(r.name)) || r.initiatorType === 'css' && /\.css/.test(r.name) ? 'css'
      : r.initiatorType === 'img' || /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/.test(r.name) ? 'img'
      : /\.(woff2?|ttf|otf)(\?|$)/.test(r.name) ? 'font' : 'other';
    bytes[t] += r.transferSize || 0;
  }
  const v = window.__vitals || {};
  return {
    ttfbMs: Math.round(nav.responseStart || 0),
    fcpMs: Math.round(fcp ? fcp.startTime : 0),
    lcpMs: Math.round(v.lcp || 0),
    lcpElement: v.lcpEl,
    cls: Math.round((v.cls || 0) * 1000) / 1000,
    tbtMs: Math.round(v.tbt || 0),
    longTasks: v.longTasks || 0,
    domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd || 0),
    loadMs: Math.round(nav.loadEventEnd || 0),
    requests: res.length + 1,
    htmlBytes: nav.transferSize || 0,
    bytes,
  };
}

// Layout/polish lint. Runs in the page; returns a list of issues.
function layoutLint() {
  const issues = [];
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const desc = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    const txt = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return txt ? `${s} "${txt}"` : s;
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
  const clippedByAncestor = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o !== 'visible') return true; } return false; };

  // Horizontal overflow — the #1 mobile layout bug.
  const docW = document.documentElement.scrollWidth;
  if (docW > vw + 1) {
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || getComputedStyle(el).position === 'fixed') continue;
      if ((r.right > vw + 1 || r.left < -1) && !clippedByAncestor(el)) {
        offenders.push(`${desc(el)} [left=${Math.round(r.left)} right=${Math.round(r.right)}]`);
        if (offenders.length >= 8) break;
      }
    }
    issues.push({ type: 'horizontal-overflow', severity: 'high', detail: `page is ${docW}px wide in a ${vw}px viewport`, offenders });
  }

  // Images.
  const dpr = window.devicePixelRatio || 1;
  for (const img of document.images) {
    if (!img.getAttribute('src') && !img.currentSrc) continue;
    if (img.complete && img.naturalWidth === 0) issues.push({ type: 'broken-image', severity: 'high', detail: img.currentSrc || img.src });
    if (!img.hasAttribute('alt')) issues.push({ type: 'img-missing-alt', severity: 'medium', detail: desc(img) + ' ' + (img.currentSrc || img.src).slice(-60) });
    const r = img.getBoundingClientRect();
    if (r.width > 0 && img.naturalWidth > 1000 && img.naturalWidth > r.width * dpr * 2.5) issues.push({ type: 'oversized-image', severity: 'medium', detail: `${(img.currentSrc || img.src).slice(-60)} is ${img.naturalWidth}px wide, rendered at ${Math.round(r.width)}px — use srcset/sizes or a smaller asset` });
    if (r.top > vh * 1.5 && img.loading !== 'lazy') issues.push({ type: 'below-fold-image-not-lazy', severity: 'low', detail: (img.currentSrc || img.src).slice(-60) });
    // Fill-style images (next/image fill, object-fit in a sized box) take their size from an absolutely positioned container.
    const fillsBox = img.dataset.nimg === 'fill' || getComputedStyle(img).position === 'absolute';
    if (!fillsBox && !img.getAttribute('width') && !img.getAttribute('height') && !getComputedStyle(img).aspectRatio.includes('/')) issues.push({ type: 'image-no-dimensions', severity: 'low', detail: `${(img.currentSrc || img.src).slice(-60)} has no width/height — risks layout shift` });
  }

  // Visually-hidden (sr-only / skip-link) elements are intentionally 1x1 and clipped.
  const srOnly = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.position === 'absolute' && r.width <= 1 && r.height <= 1; };

  // Text that is too small, or clipped by its own box.
  let small = 0; const smallEx = []; const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!direct || !visible(el) || srOnly(el)) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.fontSize) < 12) { small++; if (smallEx.length < 5) smallEx.push(`${desc(el)} (${cs.fontSize})`); }
    if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis' && clipped.length < 5) clipped.push(desc(el));
  }
  if (small) issues.push({ type: 'tiny-text', severity: 'medium', detail: `${small} text elements under 12px`, examples: smallEx });
  if (clipped.length) issues.push({ type: 'clipped-text', severity: 'medium', detail: 'text cut off by overflow:hidden', examples: clipped });

  // Tap targets on small screens.
  if (vw < 600) {
    const tiny = [];
    for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link]')) {
      if (!visible(el) || srOnly(el)) continue;
      const r = el.getBoundingClientRect();
      if ((r.width < 24 || r.height < 24) && getComputedStyle(el).display !== 'inline') tiny.push(`${desc(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    if (tiny.length) issues.push({ type: 'small-tap-targets', severity: 'medium', detail: `${tiny.length} controls smaller than 24x24`, examples: tiny.slice(0, 8) });
  }

  // Document hygiene.
  const meta = (sel) => document.querySelector(sel)?.getAttribute('content');
  if (!document.title.trim()) issues.push({ type: 'missing-title', severity: 'high' });
  else if (document.title.length > 65) issues.push({ type: 'long-title', severity: 'low', detail: `${document.title.length} chars` });
  if (!meta('meta[name="description"]')) issues.push({ type: 'missing-meta-description', severity: 'medium' });
  if (!meta('meta[name="viewport"]')) issues.push({ type: 'missing-viewport-meta', severity: 'high' });
  if (!meta('meta[property="og:image"]')) issues.push({ type: 'missing-og-image', severity: 'low', detail: 'link previews will be blank' });
  if (!document.documentElement.lang) issues.push({ type: 'missing-html-lang', severity: 'medium' });
  if (!document.querySelector('link[rel~="icon"]')) issues.push({ type: 'missing-favicon', severity: 'low' });

  // Headings.
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  const h1s = hs.filter((h) => h.tagName === 'H1').length;
  if (h1s !== 1) issues.push({ type: 'h1-count', severity: 'medium', detail: `${h1s} visible h1 elements (want exactly 1)` });
  for (let i = 1; i < hs.length; i++) {
    const a = +hs[i - 1].tagName[1], b = +hs[i].tagName[1];
    if (b > a + 1) { issues.push({ type: 'heading-skip', severity: 'low', detail: `h${a} → h${b} at ${desc(hs[i])}` }); break; }
  }

  // Unlabeled controls.
  const unlabeled = [];
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea')) {
    if (!visible(el)) continue;
    const name = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || el.querySelector('img[alt]')?.alt || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText) || el.closest('label')?.innerText || '').trim();
    if (!name) unlabeled.push(desc(el));
  }
  if (unlabeled.length) issues.push({ type: 'unlabeled-controls', severity: 'high', detail: `${unlabeled.length} interactive elements without an accessible name`, examples: unlabeled.slice(0, 8) });

  return { viewport: `${vw}x${vh}`, issues };
}

// ---------------------------------------------------------------- page helpers

async function settle(page, { scroll = false, timeout = 8000 } = {}) {
  await page.waitForLoadState('load', { timeout }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 5000) }).catch(() => {});
  if (scroll) {
    // Walk the page so lazy images and scroll-reveal animations fire, then return to top.
    await page.evaluate(async () => {
      const step = Math.max(200, window.innerHeight * 0.8);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo({ top: 0, behavior: "instant" });
    }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000); })));
    // Wait until no layout shift or running animation for ~400ms (max 3s).
    const t0 = performance.now();
    let last = performance.now();
    try { new PerformanceObserver(() => { last = performance.now(); }).observe({ type: 'layout-shift' }); } catch {}
    while (performance.now() - t0 < 3000) {
      const running = document.getAnimations?.().filter((a) => a.playState === 'running' && a.effect?.getTiming?.().iterations !== Infinity).length || 0;
      if (running) last = performance.now();
      if (performance.now() - last > 400) break;
      await new Promise((r) => setTimeout(r, 100));
    }
  }).catch(() => {});
}

function attachLoggers(page, sink) {
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) sink.console.push({ level: m.type(), text: m.text().slice(0, 500), url: page.url() }); });
  page.on('pageerror', (e) => sink.console.push({ level: 'pageerror', text: String(e.message || e).slice(0, 500), url: page.url() }));
  page.on('requestfailed', (r) => sink.network.push({ url: r.url(), failure: r.failure()?.errorText, type: r.resourceType() }));
  page.on('response', (r) => { if (r.status() >= 400) sink.network.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }); });
}

async function withFreshPage(pw, opts, fn) {
  const browser = await pw.chromium.launch({ headless: !opts.headed });
  try {
    const context = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, colorScheme: opts.theme || 'light', deviceScaleFactor: opts.dpr || 1, reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference', recordVideo: opts.recordVideo, isMobile: opts.isMobile, hasTouch: opts.isMobile });
    const page = await context.newPage();
    const sink = { console: [], network: [] };
    attachLoggers(page, sink);
    const result = await fn({ browser, context, page, sink });
    await context.close();
    return result;
  } finally { await browser.close(); }
}

// ---------------------------------------------------------------- persistent session (for interactive commands)

const SERVER_FILE = path.join(STATE, 'server.json');
const SESSION_FILE = path.join(STATE, 'session.json');

async function runServer(flags) {
  const cfg = loadConfig();
  const pw = await loadPlaywright(cfg);
  const port = +flags.port;
  const vp = resolveViewport(cfg, 'desktop');
  const context = await pw.chromium.launchPersistentContext(path.join(STATE, 'profile'), {
    headless: !flags.headed, viewport: vp, args: [`--remote-debugging-port=${port}`],
  });
  const logPath = { console: path.join(STATE, 'console.jsonl'), network: path.join(STATE, 'network.jsonl') };
  const append = (file, rec) => fs.appendFileSync(file, JSON.stringify({ t: new Date().toISOString(), ...rec }) + '\n');
  const sink = { console: { push: (r) => append(logPath.console, r) }, network: { push: (r) => append(logPath.network, r) } };
  const hook = (p) => attachLoggers(p, sink);
  context.pages().forEach(hook);
  context.on('page', hook);
  writeJson(SERVER_FILE, { pid: process.pid, port, headed: !!flags.headed, startedAt: new Date().toISOString() });
  const shutdown = async () => { try { await context.close(); } catch {} try { fs.unlinkSync(SERVER_FILE); } catch {} process.exit(0); };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
  context.on('close', () => { try { fs.unlinkSync(SERVER_FILE); } catch {} process.exit(0); });
  setInterval(() => {}, 1 << 30);
}

function serverInfo() {
  const s = readJson(SERVER_FILE, null);
  return s && alive(s.pid) ? s : null;
}

async function startServer({ headed = false } = {}) {
  const existing = serverInfo();
  if (existing) return { ...existing, reused: true };
  ensureState();
  const port = await freePort();
  const log = fs.openSync(path.join(STATE, 'server.log'), 'a');
  const args = [SCRIPT, '__server', '--port', String(port)];
  if (headed) args.push('--headed');
  spawn(process.execPath, args, { detached: true, stdio: ['ignore', log, log] }).unref();
  for (let i = 0; i < 100; i++) {
    await sleep(150);
    const s = serverInfo();
    if (s && (await reachable(`http://127.0.0.1:${s.port}/json/version`, 1000)).up) return { ...s, reused: false };
  }
  throw new CliError('Browser session failed to start.', `See ${path.join(STATE, 'server.log')}. Try "doctor".`);
}

async function connect(cfg) {
  const pw = await loadPlaywright(cfg);
  const s = await startServer();
  const browser = await pw.chromium.connectOverCDP(`http://127.0.0.1:${s.port}`);
  const context = browser.contexts()[0];
  const session = readJson(SESSION_FILE, {});
  const pages = context.pages().filter((p) => !p.isClosed());
  // Default: newest tab (follows window.open). `tab <n>` pins a specific tab instead.
  let page = (Number.isInteger(session.tab) && pages[session.tab]) || pages.at(-1) || (await context.newPage());
  await page.bringToFront().catch(() => {});
  if (session.viewport) await page.setViewportSize(session.viewport);
  if (session.theme || session.motion) await page.emulateMedia({ ...(session.theme && { colorScheme: session.theme }), ...(session.motion && { reducedMotion: session.motion }) });
  return { browser, context, page, session };
}

// ---------------------------------------------------------------- commands

const HELP = {
  doctor: 'doctor — check Playwright, browser, dev server, axe-core and session health. Prints fixes for anything broken. Run this first.',
  dev: 'dev up|down|status|logs [--lines N] [--dry-run] — manage the dev server using config.devCommand. "up" is a no-op if baseUrl already responds.',
  prod: 'prod up|down|status [--rebuild] [--dry-run] — "up" always runs a fresh build then serves it at config.prodUrl, unless a server is already up there (then it is reused as-is; pass --rebuild to rebuild and restart).',
  'form-state': 'form-state [selector=form] — fields with label, filled, invalid and error text; checked radios/checkboxes; focused field; role=status/alert messages. Use after submitting to verify validation or success.',
  start: 'start [--headed] — start the persistent browser session (auto-started by interactive commands). --headed shows the window.',
  stop: 'stop [--dry-run] — stop the persistent browser session.',
  goto: 'goto <path|url> — navigate the session page and wait for it to settle. Returns title, status and console errors seen during load.',
  info: 'info — current URL, title, viewport, theme, motion, scroll position and open tab count.',
  tabs: 'tabs — list open tabs (index, url, title, which one commands act on). Pages opened with window.open/target=_blank appear here.',
  tab: 'tab <n|newest|close-others> [--dry-run] — choose which tab later commands act on (sticky). "newest" (default) follows new tabs; "close-others" keeps only the current tab.',
  motion: 'motion <reduce|no-preference> — emulate prefers-reduced-motion for the session (sticky). "reduce" freezes scroll reveals so screenshots show final states.',
  visible: 'visible <selector> — is the element rendered, inside the viewport and not covered by another element? Returns rect, opacity and the covering element if any.',
  viewport: 'viewport <mobile|tablet|desktop|WxH> — set the session viewport (sticky across commands).',
  theme: 'theme <light|dark> — emulate prefers-color-scheme for the session (sticky).',
  snapshot: 'snapshot [--selector CSS] — accessibility-tree (ARIA) snapshot of the page or an element. Cheapest way to "see" structure.',
  screenshot: 'screenshot <out.png> [--full] [--selector CSS] [--viewport V] [--theme T] [--motion] — screenshot the session page. --full = whole page (reveals frozen at final state unless --motion). --selector captures the whole element (even taller than the viewport) with reveal animations frozen at their final state; pass --motion to keep live animation state.',
  click: 'click <selector> — click. Selectors: CSS, text=Pricing, role=button[name="Sign up"], [data-testid=x].',
  type: 'type <selector> <text> [--clear] — type into an input.',
  press: 'press <key> — keyboard press, e.g. Escape, Tab, Meta+K, Enter.',
  hover: 'hover <selector> — hover an element (check hover states, menus, tooltips).',
  scroll: 'scroll <top|bottom|+N|-N|y=N|selector> [--block start|center|end] — top/bottom; +N/-N (or bare N) scrolls RELATIVE by N px; y=N scrolls to absolute Y; a selector scrolls the element into view (default --block center). Always instant (ignores CSS smooth scrolling).',
  eval: 'eval <js expression> — evaluate JS in the page, returns the JSON result. Debug/inspect only.',
  'wait-settle': 'wait-settle [--scroll] — wait for network idle, fonts, images, animations and layout shifts to stop. --scroll first scrolls the whole page to trigger lazy content, then RETURNS TO THE TOP (it does not keep your scroll position).',
  console: 'console [--errors] [--page] [--clear] — console errors/warnings and uncaught exceptions captured by the session. Default is the whole session history; --page = only since the last goto (use this for "no new errors"); --clear resets the log.',
  network: 'network [--clear] — failed requests and 4xx/5xx responses captured by the session.',
  lint: 'lint [path] [--viewport V] [--theme T] — polish lint in a fresh browser: overflow, broken/oversized images, tiny text, tap targets, meta, headings, unlabeled controls.',
  a11y: 'a11y [path] [--viewport V] [--theme T] — axe-core audit (needs `npm i -D axe-core`). Returns violations by impact.',
  perf: 'perf [path] [--runs N] [--throttle] [--viewport V] [--out file.json] [--compare file.json] — cold-load metrics (TTFB, FCP, LCP, CLS, TBT, bytes) as medians, checked against config.budgets.',
  trace: 'trace [path] <out.json> — Chrome performance trace of a cold load (open in chrome://tracing or DevTools Performance panel).',
  sweep: 'sweep [--routes /,/about] [--viewports mobile,desktop] [--themes light,dark] [--out dir] [--motion] — screenshot + lint + console check for every route x viewport x theme. Captures with reduced motion so scroll reveals show their final state (--motion to disable). Writes a gallery index.html.',
  links: 'links [path] [--max N] — crawl internal links (rendered DOM) and report any non-2xx/3xx with the pages that link to them.',
  record: 'record [path] <out.webm> [--steps steps.json] [--viewport V] — video proof. Default journey scrolls the page; --steps runs [{"click":"text=Pricing"},{"wait":800},{"type":["#email","a@b.co"]},{"press":"Enter"},{"scroll":"bottom"},{"goto":"/about"}].',
  cleanup: 'cleanup [--dry-run] — stop the session and delete .state (logs, profile).',
};

const commands = {
  async doctor(cfg) {
    const checks = [];
    let pw = null;
    try { pw = await loadPlaywright(cfg); checks.push({ check: 'playwright', ok: true }); }
    catch (e) { checks.push({ check: 'playwright', ok: false, fix: e.hint }); }
    if (pw) {
      try { const b = await pw.chromium.launch(); await b.close(); checks.push({ check: 'chromium', ok: true }); }
      catch (e) { checks.push({ check: 'chromium', ok: false, fix: 'npx playwright install chromium', error: e.message.split('\n')[0] }); }
    }
    const site = await reachable(cfg.baseUrl);
    checks.push({ check: 'site', ok: site.up, url: cfg.baseUrl, status: site.status, fix: site.up ? undefined : `node ${path.relative(process.cwd(), SCRIPT)} dev up` });
    let axe = false;
    try { createRequire(path.join(cfg.rootAbs, 'package.json')).resolve('axe-core'); axe = true; } catch {}
    checks.push({ check: 'axe-core', ok: axe, optional: true, fix: axe ? undefined : 'npm i -D axe-core (enables the a11y command)' });
    checks.push({ check: 'config', ok: fs.existsSync(CONFIG_PATH), path: CONFIG_PATH, fix: fs.existsSync(CONFIG_PATH) ? undefined : 'Create verify.config.json (defaults are in use)' });
    const s = serverInfo();
    checks.push({ check: 'session', ok: true, running: !!s, port: s?.port });
    return { healthy: checks.every((c) => c.ok || c.optional), checks, config: { baseUrl: cfg.baseUrl, devCommand: cfg.devCommand, root: cfg.rootAbs, routes: cfg.routes } };
  },

  async dev(cfg, [action = 'status'], flags) {
    const pidFile = path.join(STATE, 'dev.json');
    const logFile = path.join(STATE, 'dev.log');
    const info = readJson(pidFile, null);
    if (action === 'status') return { url: cfg.baseUrl, ...(await reachable(cfg.baseUrl)), managedPid: info && alive(info.pid) ? info.pid : null };
    if (action === 'logs') {
      if (!fs.existsSync(logFile)) return { lines: [], note: 'No managed dev server log yet.' };
      return { lines: fs.readFileSync(logFile, 'utf8').split('\n').slice(-(+flags.lines || 60)) };
    }
    if (action === 'up') {
      const r = await reachable(cfg.baseUrl);
      if (r.up) return { url: cfg.baseUrl, alreadyRunning: true, status: r.status };
      if (flags['dry-run']) return { dryRun: true, wouldRun: cfg.devCommand, cwd: cfg.rootAbs };
      ensureState();
      const log = fs.openSync(logFile, 'w');
      const child = spawn(cfg.devCommand, { cwd: cfg.rootAbs, shell: true, detached: true, stdio: ['ignore', log, log] });
      child.unref();
      writeJson(pidFile, { pid: child.pid, command: cfg.devCommand });
      for (let i = 0; i < 120; i++) {
        await sleep(500);
        if ((await reachable(cfg.baseUrl, 1500)).up) return { url: cfg.baseUrl, started: true, pid: child.pid, secondsToReady: (i + 1) / 2 };
        if (!alive(child.pid)) break;
      }
      throw new CliError(`Dev server did not come up at ${cfg.baseUrl}.`, `Check logs: node ${path.relative(process.cwd(), SCRIPT)} dev logs. Is baseUrl/devCommand right in verify.config.json?`);
    }
    if (action === 'down') {
      if (!info || !alive(info.pid)) return { stopped: false, note: 'No dev server managed by this CLI is running (one started elsewhere is left alone).' };
      if (flags['dry-run']) return { dryRun: true, wouldKillProcessGroup: info.pid };
      try { process.kill(-info.pid, 'SIGTERM'); } catch { process.kill(info.pid, 'SIGTERM'); }
      fs.unlinkSync(pidFile);
      return { stopped: true, pid: info.pid };
    }
    throw new CliError(`Unknown dev action "${action}".`, HELP.dev);
  },

  async prod(cfg, [action = 'status'], flags) {
    const url = cfg.prodUrl, build = cfg.prodBuildCommand, startCmd = cfg.prodStartCommand;
    if (!url || !build || !startCmd) throw new CliError('prod needs prodUrl, prodBuildCommand and prodStartCommand in verify.config.json.', 'Add them (e.g. "npx next build", "npx next start -p 3101", "http://localhost:3101").');
    const pidFile = path.join(STATE, 'prod.json');
    const logFile = path.join(STATE, 'prod.log');
    const info = readJson(pidFile, null);
    if (action === 'status') return { url, ...(await reachable(url)), managedPid: info && alive(info.pid) ? info.pid : null };
    if (action === 'up') {
      if ((await reachable(url)).up && !flags.rebuild) return { url, alreadyRunning: true, hint: 'Serving an earlier build. Use `prod down` then `prod up` (or --rebuild) after code changes.' };
      if (flags['dry-run']) return { dryRun: true, wouldRun: [build, startCmd], cwd: cfg.rootAbs };
      if (info && alive(info.pid)) { try { process.kill(-info.pid, 'SIGTERM'); } catch { process.kill(info.pid, 'SIGTERM'); } await sleep(800); }
      ensureState();
      const t = Date.now();
      const b = spawnSync(build, { cwd: cfg.rootAbs, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      fs.writeFileSync(logFile, `$ ${build}\n${b.stdout}${b.stderr}`);
      if (b.status !== 0) throw new CliError(`Production build failed (exit ${b.status}).`, `Read the log: ${path.relative(process.cwd(), logFile)}`);
      const log = fs.openSync(logFile, 'a');
      const child = spawn(startCmd, { cwd: cfg.rootAbs, shell: true, detached: true, stdio: ['ignore', log, log] });
      child.unref();
      writeJson(pidFile, { pid: child.pid, command: startCmd });
      for (let i = 0; i < 60; i++) {
        await sleep(500);
        if ((await reachable(url, 1500)).up) return { url, started: true, freshBuild: true, pid: child.pid, buildSeconds: Math.round((Date.now() - t) / 1000), hint: `Measure with: perf ${url}/ --runs 3 --throttle --viewport mobile` };
        if (!alive(child.pid)) break;
      }
      throw new CliError(`Production server did not come up at ${url}.`, `Read the log: ${path.relative(process.cwd(), logFile)}. Is the port free?`);
    }
    if (action === 'down') {
      if (!info || !alive(info.pid)) return { stopped: false, note: 'No production server managed by this CLI is running.' };
      if (flags['dry-run']) return { dryRun: true, wouldKillProcessGroup: info.pid };
      try { process.kill(-info.pid, 'SIGTERM'); } catch { process.kill(info.pid, 'SIGTERM'); }
      fs.unlinkSync(pidFile);
      return { stopped: true, pid: info.pid };
    }
    throw new CliError(`Unknown prod action "${action}".`, HELP.prod);
  },

  async 'form-state'(cfg, [sel = 'form']) {
    const { page } = await connect(cfg);
    const loc = page.locator(sel).first();
    if (!(await loc.count())) {
      const status = await page.locator('[role=status], [role=alert]').allInnerTexts();
      if (status.length) return { selector: sel, form: null, messages: status.map((t) => t.trim()).filter(Boolean), note: 'No form found; showing status/alert messages (the form may have been replaced by a success state).' };
      throw new CliError(`No element matches "${sel}".`, 'Run `snapshot` to find the form, or pass a selector: form-state "#contact form".');
    }
    return { selector: sel, ...(await loc.evaluate((form) => {
      const text = (ids) => (ids || '').split(/\s+/).map((id) => document.getElementById(id)?.textContent.trim()).filter(Boolean);
      const labelOf = (el) => (el.labels?.[0]?.textContent || el.getAttribute('aria-label') || el.name || el.id || '').trim().replace(/\s+/g, ' ');
      const fields = [...form.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea')].map((el) => {
        const invalid = el.getAttribute('aria-invalid') === 'true' || !el.checkValidity();
        // Error text = what aria-errormessage/aria-describedby point at while the field is invalid, plus native validationMessage.
        const errors = invalid ? [...text(el.getAttribute('aria-errormessage')), ...text(el.getAttribute('aria-describedby')), el.validationMessage].filter(Boolean) : [];
        return { field: el.id || el.name, label: labelOf(el), filled: !!el.value, valueLength: el.value.length, invalid, errors, focused: document.activeElement === el };
      });
      const groups = {};
      for (const el of form.querySelectorAll('input[type=radio], input[type=checkbox]')) { (groups[el.name] ||= []); if (el.checked) groups[el.name].push(el.value); }
      const messages = [...document.querySelectorAll('[role=status], [role=alert]')].map((m) => m.textContent.trim()).filter(Boolean);
      return { fields, choices: groups, invalidCount: fields.filter((f) => f.invalid).length, focused: document.activeElement?.id || document.activeElement?.name || null, messages };
    })) };
  },

  async start(cfg, _p, flags) { return await startServer({ headed: !!flags.headed }); },

  async stop(_cfg, _p, flags) {
    const s = serverInfo();
    if (!s) return { stopped: false, note: 'No session running.' };
    if (flags['dry-run']) return { dryRun: true, wouldStopPid: s.pid };
    process.kill(s.pid, 'SIGTERM');
    return { stopped: true, pid: s.pid };
  },

  async goto(cfg, [target], flags) {
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    const consoleFile = path.join(STATE, 'console.jsonl');
    const before = fs.existsSync(consoleFile) ? fs.readFileSync(consoleFile, 'utf8').split('\n').length : 0;
    const { page } = await connect(cfg);
    writeJson(SESSION_FILE, { ...readJson(SESSION_FILE, {}), lastGotoAt: new Date().toISOString() });
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await settle(page, { scroll: !!flags.scroll });
    await sleep(100);
    const after = fs.existsSync(consoleFile) ? fs.readFileSync(consoleFile, 'utf8').split('\n').filter(Boolean).slice(Math.max(0, before - 1)) : [];
    const errors = after.map((l) => JSON.parse(l)).filter((r) => r.level !== 'warning');
    return { url: page.url(), status: res?.status(), title: await page.title(), consoleErrors: errors };
  },

  async info(cfg) {
    const { page, session } = await connect(cfg);
    const scroll = await page.evaluate(() => ({ y: Math.round(scrollY), height: document.documentElement.scrollHeight }));
    const tabs = page.context().pages().filter((p) => !p.isClosed()).length;
    return { url: page.url(), title: await page.title(), viewport: page.viewportSize(), theme: session.theme || 'light', motion: session.motion || 'no-preference', scroll, tabs, ...(tabs > 1 && { hint: 'More than one tab is open. Run `tabs` to see them and `tab <n>` to switch.' }) };
  },

  async tabs(cfg) {
    const { context, page } = await connect(cfg);
    const pages = context.pages().filter((p) => !p.isClosed());
    return { tabs: await Promise.all(pages.map(async (p, i) => ({ index: i, url: p.url(), title: await p.title().catch(() => ''), current: p === page }))), pinned: readJson(SESSION_FILE, {}).tab ?? 'newest' };
  },

  async tab(cfg, [which], flags) {
    if (!which) throw new CliError('Missing tab.', HELP.tab);
    const session = readJson(SESSION_FILE, {});
    if (which === 'newest') { delete session.tab; writeJson(SESSION_FILE, session); return commands.tabs(cfg); }
    const { context, page } = await connect(cfg);
    const pages = context.pages().filter((p) => !p.isClosed());
    if (which === 'close-others') {
      const others = pages.filter((p) => p !== page);
      if (flags['dry-run']) return { dryRun: true, wouldClose: others.map((p) => p.url()) };
      for (const p of others) await p.close();
      delete session.tab; writeJson(SESSION_FILE, session);
      return { closed: others.length, current: page.url() };
    }
    const n = Number(which);
    if (!Number.isInteger(n) || !pages[n]) throw new CliError(`No tab ${which}. ${pages.length} tab(s) open.`, 'Run `tabs` to list them.');
    writeJson(SESSION_FILE, { ...session, tab: n });
    return { current: n, url: pages[n].url() };
  },

  async motion(cfg, [m]) {
    if (!['reduce', 'no-preference'].includes(m)) throw new CliError(`Motion must be reduce or no-preference, got "${m}".`, HELP.motion);
    writeJson(SESSION_FILE, { ...readJson(SESSION_FILE, {}), motion: m });
    await connect(cfg);
    return { motion: m };
  },

  async visible(cfg, [sel]) {
    if (!sel) throw new CliError('Missing selector.', HELP.visible);
    const { page } = await connect(cfg);
    const loc = page.locator(sel).first();
    if (!(await loc.count())) throw new CliError(`No element matches "${sel}".`, 'Check the selector with `snapshot`.');
    const r = await loc.evaluate((el) => {
      const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const inViewport = b.width > 0 && b.height > 0 && b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth;
      const hit = inViewport ? document.elementFromPoint(cx, cy) : null;
      const covered = inViewport && hit && !el.contains(hit) && !hit.contains(el);
      const d = (n) => n && (n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.') : ''));
      return { rect: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, display: cs.display, visibility: cs.visibility, opacity: +cs.opacity, inViewport, covered: !!covered, coveredBy: covered ? d(hit) : null };
    });
    const visible = r.display !== 'none' && r.visibility !== 'hidden' && r.opacity > 0.1 && r.inViewport && !r.covered;
    return { selector: sel, visible, ...r, ...(!visible && { hint: r.inViewport ? 'Element is in the viewport but hidden, transparent or covered (see coveredBy).' : 'Element is outside the viewport. Try `scroll <selector>` first.' }) };
  },

  async viewport(cfg, [v]) {
    const vp = resolveViewport(cfg, v);
    if (!vp) throw new CliError('Missing viewport.', HELP.viewport);
    writeJson(SESSION_FILE, { ...readJson(SESSION_FILE, {}), viewport: vp });
    const { page } = await connect(cfg);
    return { viewport: page.viewportSize() };
  },

  async theme(cfg, [t]) {
    if (!['light', 'dark'].includes(t)) throw new CliError(`Theme must be light or dark, got "${t}".`, HELP.theme);
    writeJson(SESSION_FILE, { ...readJson(SESSION_FILE, {}), theme: t });
    await connect(cfg);
    return { theme: t };
  },

  async snapshot(cfg, _p, flags) {
    const { page } = await connect(cfg);
    const loc = page.locator(flags.selector || 'body').first();
    if (!(await loc.count())) throw new CliError(`No element matches "${flags.selector}".`, 'Run snapshot without --selector to see the page structure.');
    return { url: page.url(), snapshot: await loc.ariaSnapshot() };
  },

  async screenshot(cfg, [outPath], flags) {
    if (!outPath) throw new CliError('Missing output path.', HELP.screenshot);
    const { page } = await connect(cfg);
    if (flags.viewport) await page.setViewportSize(resolveViewport(cfg, flags.viewport));
    if (flags.theme) await page.emulateMedia({ colorScheme: flags.theme });
    // Full-page captures don't scroll, so scroll-driven reveals below the fold would be caught mid-animation.
    // Freeze motion for the capture (final states), unless --motion asks for live animation state.
    const freeze = flags.full && !flags.motion;
    if (freeze) await page.emulateMedia({ reducedMotion: 'reduce' });
    if (flags.full) await settle(page, { scroll: true });
    const abs = path.resolve(outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    if (flags.selector) {
      const loc = page.locator(flags.selector).first();
      if (!(await loc.count())) throw new CliError(`No element matches "${flags.selector}".`, 'Check the selector with `snapshot`.');
      // Freeze reveal animations so the element is captured in its final state (restored afterwards).
      const session = readJson(SESSION_FILE, {});
      if (!flags.motion) await page.emulateMedia({ reducedMotion: 'reduce' });
      // Capture via a full-page clip of the element's document box: never clipped by the viewport, and taken
      // from scroll top so sticky/fixed bars sit at the top of the document instead of over the element.
      await loc.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await sleep(150);
      const box = await loc.evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; });
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(150);
      await page.screenshot({ path: abs, fullPage: true, animations: 'disabled', clip: box });
      if (!flags.motion) await page.emulateMedia({ reducedMotion: session.motion || 'no-preference' });
    }
    else await page.screenshot({ path: abs, fullPage: !!flags.full, animations: freeze ? 'disabled' : 'allow' });
    if (freeze) await page.emulateMedia({ reducedMotion: readJson(SESSION_FILE, {}).motion || 'no-preference' });
    return { path: abs, url: page.url(), viewport: page.viewportSize() };
  },

  async click(cfg, [sel]) {
    if (!sel) throw new CliError('Missing selector.', HELP.click);
    const { page } = await connect(cfg);
    const loc = page.locator(sel).first();
    const n = await page.locator(sel).count();
    if (!n) throw new CliError(`No element matches "${sel}".`, 'Run "snapshot" to see roles and names, then use role=button[name="..."] or text=... selectors.');
    const urlBefore = page.url();
    const what = await loc.evaluate((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 50)}"`).catch(() => null);
    try {
      await loc.click({ timeout: 10000 });
    } catch (e) {
      const msg = String(e.message || e);
      if (/intercepts pointer events/.test(msg)) {
        const by = (msg.match(/<([a-z]+[^>]*)>[^<]*<\/[a-z]+> (?:from|subtree) .*intercepts pointer events/) || [])[1];
        throw new CliError(`Click on "${sel}" was blocked: another element is on top of it${by ? ` (<${by.slice(0, 80)}>)` : ''}.`, 'If this is a visually-hidden radio/checkbox, click its label instead, e.g. label:has(input[value="no"]). Otherwise check `visible <selector>` for what covers it.');
      }
      throw new CliError(`Click on "${sel}" failed: ${msg.split('\n')[0]}`, 'Run `visible <selector>` and `snapshot` to check the element is on screen and enabled.');
    }
    await settle(page);
    return { clicked: sel, target: what, matches: n, navigated: page.url() !== urlBefore, url: page.url(),
      ...(n > 1 && { warning: `Selector matched ${n} elements; clicked the first (${what}).`, hint: 'Make it unique: quote text for an exact match (text="No"), scope it (#form >> ...), or use role=…[name="…" i] / >> nth=N deliberately.' }) };
  },

  async type(cfg, [sel, ...rest], flags) {
    const text = rest.join(' ');
    if (!sel || !text) throw new CliError('Usage: type <selector> <text>', HELP.type);
    const { page } = await connect(cfg);
    const loc = page.locator(sel).first();
    if (flags.clear) await loc.fill('');
    await loc.pressSequentially(text, { delay: 10 });
    return { typed: text, into: sel, value: await loc.inputValue().catch(() => null) };
  },

  async press(cfg, [key]) {
    if (!key) throw new CliError('Missing key.', HELP.press);
    const { page } = await connect(cfg);
    await page.keyboard.press(key);
    await settle(page, { timeout: 3000 });
    return { pressed: key, url: page.url(), focused: await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body (nothing focused)'; return (a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + ' ' + (a.getAttribute('aria-label') || a.innerText || a.value || '').trim().replace(/\s+/g, ' ').slice(0, 40)).trim(); }) };
  },

  async hover(cfg, [sel]) {
    const { page } = await connect(cfg);
    await page.locator(sel).first().hover({ timeout: 10000 });
    await sleep(300);
    return { hovered: sel };
  },

  async scroll(cfg, [where = 'bottom'], flags) {
    const { page } = await connect(cfg);
    if (where === 'top') await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    else if (where === 'bottom') await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    else if (/^y=\d+$/.test(where)) await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), +where.slice(2));
    else if (/^[+-]?\d+$/.test(where)) await page.evaluate((y) => scrollBy({ top: y, behavior: 'instant' }), +where);
    else {
      const block = flags.block || 'center';
      if (!['start', 'center', 'end', 'nearest'].includes(block)) throw new CliError(`--block must be start, center, end or nearest.`, HELP.scroll);
      const loc = page.locator(where).first();
      if (!(await loc.count())) throw new CliError(`No element matches "${where}".`, 'Check the selector with `snapshot`, or use top|bottom|+N|y=N.');
      await loc.evaluate((el, b) => el.scrollIntoView({ block: b, behavior: 'instant' }), block);
    }
    await settle(page, { timeout: 3000 });
    return { scrollY: await page.evaluate(() => Math.round(scrollY)) };
  },

  async eval(cfg, parts) {
    const expr = parts.join(' ');
    if (!expr) throw new CliError('Missing expression.', HELP.eval);
    const { page } = await connect(cfg);
    return { result: await page.evaluate((e) => { const v = (0, eval)(e); return v instanceof Promise ? v : JSON.parse(JSON.stringify(v ?? null)); }, expr) };
  },

  async 'wait-settle'(cfg, _p, flags) {
    const { page } = await connect(cfg);
    const t = Date.now();
    await settle(page, { scroll: !!flags.scroll });
    return { settledInMs: Date.now() - t };
  },

  async console(_cfg, _p, flags) {
    const f = path.join(STATE, 'console.jsonl');
    if (flags.clear) { fs.rmSync(f, { force: true }); return { cleared: true }; }
    let recs = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
    if (flags.errors) recs = recs.filter((r) => r.level !== 'warning');
    if (flags.page) { const since = readJson(SESSION_FILE, {}).lastGotoAt; if (since) recs = recs.filter((r) => r.t >= since); }
    return { count: recs.length, entries: recs.slice(-50), ...(!flags.page && recs.length && { hint: 'This is the whole session history. Use --page for entries since the last goto, or --clear to reset.' }) };
  },

  async network(_cfg, _p, flags) {
    const f = path.join(STATE, 'network.jsonl');
    if (flags.clear) { fs.rmSync(f, { force: true }); return { cleared: true }; }
    const recs = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
    return { count: recs.length, entries: recs.slice(-50) };
  },

  async lint(cfg, [target], flags) {
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    const pw = await loadPlaywright(cfg);
    const vp = resolveViewport(cfg, flags.viewport || 'desktop');
    return await withFreshPage(pw, { viewport: vp, theme: flags.theme, isMobile: vp.width < 600 }, async ({ page, sink }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await settle(page, { scroll: true });
      const r = await page.evaluate(layoutLint);
      const counts = r.issues.reduce((a, i) => ((a[i.severity] = (a[i.severity] || 0) + 1), a), {});
      return { url, ...r, counts, consoleErrors: sink.console.filter((c) => c.level !== 'warning'), failedRequests: sink.network };
    });
  },

  async a11y(cfg, [target], flags) {
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    let axePath;
    try { axePath = createRequire(path.join(cfg.rootAbs, 'package.json')).resolve('axe-core/axe.min.js'); }
    catch { throw new CliError('axe-core is not installed.', 'Run: npm i -D axe-core   (or use "lint" for the built-in checks)'); }
    const pw = await loadPlaywright(cfg);
    return await withFreshPage(pw, { viewport: resolveViewport(cfg, flags.viewport || 'desktop'), theme: flags.theme }, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await settle(page, { scroll: true });
      await page.addScriptTag({ path: axePath });
      const res = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
      const violations = res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')), helpUrl: v.helpUrl }));
      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      violations.sort((a, b) => order[a.impact] - order[b.impact]);
      return { url, violationCount: violations.length, violations };
    });
  },

  async perf(cfg, [target], flags) {
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    const pw = await loadPlaywright(cfg);
    const runs = +flags.runs || 3;
    const vp = resolveViewport(cfg, flags.viewport || 'desktop');
    const samples = [];
    for (let i = 0; i < runs; i++) {
      samples.push(await withFreshPage(pw, { viewport: vp, isMobile: vp.width < 600 }, async ({ context, page }) => {
        if (flags.throttle) {
          const cdp = await context.newCDPSession(page);
          await cdp.send('Network.enable');
          await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        }
        await page.addInitScript(VITALS_INIT);
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await sleep(1000);
        return await page.evaluate(readVitals);
      }));
    }
    const keys = ['ttfbMs', 'fcpMs', 'lcpMs', 'cls', 'tbtMs', 'domContentLoadedMs', 'loadMs', 'requests'];
    const med = Object.fromEntries(keys.map((k) => [k, median(samples.map((s) => s[k]))]));
    const bytesKb = Object.fromEntries(Object.keys(samples[0].bytes).map((k) => [k, kb(median(samples.map((s) => s.bytes[k])))]));
    const totalKb = kb(median(samples.map((s) => s.htmlBytes + Object.values(s.bytes).reduce((a, b) => a + b, 0))));
    const b = cfg.budgets;
    const budgets = [
      { metric: 'lcpMs', value: med.lcpMs, budget: b.lcpMs, pass: med.lcpMs <= b.lcpMs },
      { metric: 'cls', value: med.cls, budget: b.cls, pass: med.cls <= b.cls },
      { metric: 'tbtMs', value: med.tbtMs, budget: b.tbtMs, pass: med.tbtMs <= b.tbtMs },
      { metric: 'jsKb', value: bytesKb.script, budget: b.jsKb, pass: bytesKb.script <= b.jsKb },
      { metric: 'totalKb', value: totalKb, budget: b.totalKb, pass: totalKb <= b.totalKb },
    ];
    const result = { url, runs, throttled: !!flags.throttle, viewport: vp, median: med, lcpElement: samples.at(-1).lcpElement, bytesKb, totalKb, budgets, allBudgetsPass: budgets.every((x) => x.pass), ...(new URL(url).origin === new URL(cfg.baseUrl).origin && { note: 'This is the dev server (unminified, slow). For real numbers: `prod up`, then perf against config.prodUrl.' }) };
    if (flags.compare) {
      const prev = readJson(path.resolve(flags.compare), null);
      if (!prev) throw new CliError(`Cannot read ${flags.compare}.`, 'Save a baseline first with --out baseline.json');
      result.delta = Object.fromEntries(keys.map((k) => [k, Math.round((med[k] - prev.median[k]) * 1000) / 1000]));
      result.delta.totalKb = Math.round((totalKb - prev.totalKb) * 10) / 10;
    }
    if (flags.out) { fs.writeFileSync(path.resolve(flags.out), JSON.stringify(result, null, 2)); result.savedTo = path.resolve(flags.out); }
    return result;
  },

  async trace(cfg, args, flags) {
    const [target, outPath] = args.length > 1 ? args : [undefined, args[0]];
    if (!outPath) throw new CliError('Missing output path.', HELP.trace);
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    const pw = await loadPlaywright(cfg);
    const abs = path.resolve(outPath);
    await withFreshPage(pw, { viewport: resolveViewport(cfg, flags.viewport || 'desktop') }, async ({ browser, page }) => {
      await browser.startTracing(page, { path: abs, screenshots: true });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await browser.stopTracing();
    });
    return { path: abs, sizeKb: kb(fs.statSync(abs).size), open: 'Load in Chrome DevTools > Performance > Load profile' };
  },

  async sweep(cfg, _p, flags) {
    const routes = flags.routes ? String(flags.routes).split(',') : cfg.routes;
    const vps = (flags.viewports ? String(flags.viewports).split(',') : Object.keys(cfg.viewports));
    const themes = flags.themes ? String(flags.themes).split(',') : ['light'];
    const outDir = path.resolve(flags.out || path.join(STATE, 'sweep'));
    await requireSite(cfg, resolveUrl(cfg, routes[0]));
    fs.mkdirSync(outDir, { recursive: true });
    const pw = await loadPlaywright(cfg);
    const browser = await pw.chromium.launch();
    const jobs = routes.flatMap((r) => vps.flatMap((v) => themes.map((t) => ({ route: r, vpName: v, theme: t }))));
    const results = [];
    const worker = async () => {
      for (let job = jobs.shift(); job; job = jobs.shift()) {
        const vp = resolveViewport(cfg, job.vpName);
        // Reduced motion = final states in full-page captures (scroll-driven reveals never run without scrolling). --motion keeps live state.
        const context = await browser.newContext({ viewport: vp, colorScheme: job.theme, isMobile: vp.width < 600, hasTouch: vp.width < 600, reducedMotion: flags.motion ? 'no-preference' : 'reduce' });
        const page = await context.newPage();
        const sink = { console: [], network: [] };
        attachLoggers(page, sink);
        const file = `${job.route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}-${job.vpName}-${job.theme}.png`;
        try {
          const res = await page.goto(resolveUrl(cfg, job.route), { waitUntil: 'domcontentloaded', timeout: 30000 });
          await settle(page, { scroll: true });
          const lint = await page.evaluate(layoutLint);
          await page.screenshot({ path: path.join(outDir, file), fullPage: true });
          // Routes listed in config.expectNotFound are supposed to return 404; that document error is not a problem.
          const expected404 = (cfg.expectNotFound || []).includes(job.route);
          const consoleErrors = sink.console.filter((c) => c.level !== 'warning' && !(expected404 && / 404 /.test(c.text) && new URL(c.url || 'http://x/').pathname === job.route));
          results.push({ ...job, status: res?.status(), screenshot: path.join(outDir, file), issues: lint.issues, consoleErrors, failedRequests: sink.network });
        } catch (e) {
          results.push({ ...job, error: e.message.split('\n')[0] });
        } finally { await context.close(); }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
    await browser.close();
    results.sort((a, b) => (a.route + a.vpName + a.theme).localeCompare(b.route + b.vpName + b.theme));
    const sev = (r, s) => (r.issues || []).filter((i) => i.severity === s).length;
    const gallery = `<!doctype html><meta charset=utf-8><title>Sweep</title><style>body{font:14px system-ui;margin:24px;background:#111;color:#eee}.g{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0;background:#1c1c1c;padding:8px;border-radius:8px;max-width:420px}img{width:100%;max-height:600px;object-fit:cover;object-position:top;border-radius:4px}figcaption{padding:6px 0}.bad{color:#ff7b72}</style><h1>Sweep — ${new Date().toISOString()}</h1><div class=g>${results.map((r) => `<figure><a href="${path.basename(r.screenshot || '')}"><img src="${path.basename(r.screenshot || '')}"></a><figcaption><b>${r.route}</b> · ${r.vpName} · ${r.theme} ${r.error ? `<div class=bad>${r.error}</div>` : `· ${sev(r, 'high')} high / ${sev(r, 'medium')} med · ${r.consoleErrors.length} console errors`}</figcaption></figure>`).join('')}</div>`;
    fs.writeFileSync(path.join(outDir, 'index.html'), gallery);
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(results, null, 2));
    const problems = results.filter((r) => r.error || sev(r, 'high') || r.consoleErrors?.length).map((r) => ({ route: r.route, viewport: r.vpName, theme: r.theme, error: r.error, high: (r.issues || []).filter((i) => i.severity === 'high'), consoleErrors: r.consoleErrors?.slice(0, 3) }));
    return { combos: results.length, outDir, gallery: path.join(outDir, 'index.html'), problems, clean: problems.length === 0 };
  },

  async links(cfg, [target], flags) {
    const startUrl = new URL(resolveUrl(cfg, target)); startUrl.hash = '';
    const start = startUrl.href;
    await requireSite(cfg, start);
    const origin = new URL(start).origin;
    const max = +flags.max || 40;
    const pw = await loadPlaywright(cfg);
    return await withFreshPage(pw, {}, async ({ context, page }) => {
      const queue = [start], seen = new Set([start]), linkedFrom = {}, status = {};
      let crawled = 0;
      while (queue.length && crawled < max) {
        const url = queue.shift();
        const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch((e) => ({ status: () => 0, err: e.message }));
        status[url] = res.status();
        crawled++;
        if (res.status() >= 400 || !(res.headers?.()['content-type'] || '').includes('html')) continue;
        await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
        const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
        for (const h of hrefs) {
          let u; try { u = new URL(h); } catch { continue; }
          if (u.origin !== origin || /^(mailto|tel):/.test(h)) continue;
          u.hash = '';
          const key = u.href;
          (linkedFrom[key] ||= new Set()).add(url);
          if (!seen.has(key)) { seen.add(key); queue.push(key); }
        }
      }
      for (const u of queue) { const r = await context.request.get(u, { maxRedirects: 5 }).catch(() => null); status[u] = r ? r.status() : 0; }
      const broken = Object.entries(status).filter(([, s]) => s === 0 || s >= 400).map(([url, s]) => ({ url, status: s, linkedFrom: [...(linkedFrom[url] || [])].slice(0, 5) }));
      return { checked: Object.keys(status).length, crawled, broken, clean: broken.length === 0 };
    });
  },

  async record(cfg, args, flags) {
    const [target, outPath] = args.length > 1 ? args : [undefined, args[0]];
    if (!outPath) throw new CliError('Missing output path.', HELP.record);
    const url = resolveUrl(cfg, target);
    await requireSite(cfg, url);
    const pw = await loadPlaywright(cfg);
    const vp = resolveViewport(cfg, flags.viewport || 'desktop');
    const steps = flags.steps ? readJson(path.resolve(flags.steps), null) : null;
    if (flags.steps && !Array.isArray(steps)) throw new CliError(`Steps file ${flags.steps} must be a JSON array.`, HELP.record);
    const tmp = fs.mkdtempSync(path.join(STATE.replace(/\.state$/, ''), '.state-video-'));
    const sink = await withFreshPage(pw, { viewport: vp, theme: flags.theme, isMobile: vp.width < 600, recordVideo: { dir: tmp, size: vp } }, async ({ page, sink }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await settle(page);
      await sleep(600);
      const smoothScroll = async (to) => { await page.evaluate(async (target) => { const end = target === 'bottom' ? document.documentElement.scrollHeight - innerHeight : 0; const start = scrollY; const n = 60; for (let i = 1; i <= n; i++) { scrollTo({ top: start + ((end - start) * i) / n, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 30)); } }, to); await sleep(400); };
      for (const s of steps || [{ scroll: 'bottom' }, { wait: 500 }, { scroll: 'top' }]) {
        if (s.goto) { await page.goto(resolveUrl(cfg, s.goto)); await settle(page); }
        if (s.click) { await page.locator(s.click).first().click(); await settle(page, { timeout: 3000 }); }
        if (s.hover) await page.locator(s.hover).first().hover();
        if (s.type) await page.locator(s.type[0]).first().pressSequentially(s.type[1], { delay: 40 });
        if (s.press) await page.keyboard.press(s.press);
        if (s.scroll) await smoothScroll(s.scroll);
        await sleep(s.wait || 500);
      }
      return sink;
    });
    // Popups (window.open, target=_blank) get their own recordings; keep the longest one, the main journey.
    const vids = fs.readdirSync(tmp).filter((f) => f.endsWith('.webm')).sort((a, b) => fs.statSync(path.join(tmp, b)).size - fs.statSync(path.join(tmp, a)).size);
    const vid = vids[0];
    if (!vid) throw new CliError('No video was recorded.', 'Check the steps file and that the page loaded (goto the route first).');
    const abs = path.resolve(outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.renameSync(path.join(tmp, vid), abs);
    fs.rmSync(tmp, { recursive: true, force: true });
    return { path: abs, sizeKb: kb(fs.statSync(abs).size), ...(vids.length > 1 && { note: `${vids.length - 1} popup tab recording(s) discarded; kept the main journey.` }), consoleErrors: sink.console.filter((c) => c.level !== 'warning') };
  },

  async cleanup(cfg, _p, flags) {
    const s = serverInfo();
    const dev = readJson(path.join(STATE, 'dev.json'), null);
    const devPid = dev && alive(dev.pid) ? dev.pid : null;
    if (flags['dry-run']) return { dryRun: true, wouldStopSession: s?.pid || null, wouldStopDevServer: devPid, wouldDelete: STATE };
    if (s) { process.kill(s.pid, 'SIGTERM'); await sleep(500); }
    if (devPid) await commands.dev(cfg, ['down'], {});
    fs.rmSync(STATE, { recursive: true, force: true });
    return { cleaned: STATE, stoppedDevServer: devPid };
  },
};

// ---------------------------------------------------------------- main

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, flags } = parseArgs(rest);
  if (cmd === '__server') return runServer(flags);
  if (!cmd || cmd === 'help' || cmd === '--help' || flags.help) {
    const which = cmd && cmd !== 'help' && cmd !== '--help' ? cmd : pos[0];
    if (which && HELP[which]) return out({ help: HELP[which] });
    return out({
      usage: `node ${path.relative(process.cwd(), SCRIPT)} <command> [args] [--flags]`,
      groups: {
        health: ['doctor', 'dev', 'prod', 'start', 'stop', 'cleanup'],
        navigate: ['goto', 'info', 'tabs', 'tab', 'viewport', 'theme', 'motion', 'scroll'],
        inspect: ['snapshot', 'screenshot', 'visible', 'form-state', 'console', 'network', 'eval'],
        interact: ['click', 'type', 'press', 'hover', 'wait-settle'],
        quality: ['lint', 'a11y', 'sweep', 'links'],
        performance: ['perf', 'trace', 'prod'],
        evidence: ['screenshot', 'record', 'sweep'],
      },
      commands: HELP,
      notes: ['All output is JSON. ok:false results include a hint.', 'Interactive commands share one persistent browser session; quality/perf commands use a fresh browser each run.', 'Base URL comes from verify.config.json or SITE_URL.'],
    });
  }
  const fn = commands[cmd];
  if (!fn) throw new CliError(`Unknown command "${cmd}".`, `Run "help" to list commands. Closest: ${Object.keys(commands).filter((c) => c[0] === cmd[0]).join(', ') || 'n/a'}`);
  const cfg = loadConfig();
  out(await fn(cfg, pos, flags));
  process.exit(0);
}

main().catch((e) => {
  if (!(e instanceof CliError) && /Executable doesn't exist/.test(e.message)) e.hint = 'Run: npx playwright install chromium';
  if (!(e instanceof CliError) && /Timeout/.test(e.message)) e.hint ||= 'Element or page did not become ready. Run "snapshot" to check the selector, or "screenshot" to see the current state.';
  fail(e);
});
