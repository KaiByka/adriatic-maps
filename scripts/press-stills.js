#!/usr/bin/env node
/*
 * Deterministic press-still generator for charts.marespot.com.
 *
 * Usage:  cd scripts && npm install && node press-stills.js
 * Deps:   sharp (^0.33, see package.json) + system fontconfig with Liberation Sans.
 *
 * Reads:  site/img/*_sm.jpg, site/LICENSE-MANIFEST.json, site/index.html (SCENES, NOW_POS)
 * Writes: site/press/{key}-then-now.jpg  (19 chart scenes, 1920x1080, q82, <=450 KB)
 *         site/press/hero-adriatic.jpg   (hard copy of admiralty1877 still)
 *         site/press/hero-islands.jpg   (hard copy of isole1697 still)
 *         site/press/og.jpg             (1200x630, admiralty1877 composition)
 *         site/press/index.html         (press index page, credits from the manifest)
 *
 * Deterministic: no clocks, no randomness; rerunning produces identical bytes.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const PRESS = path.join(SITE, 'press');
const SAT = path.join(SITE, 'img', 'nasa2003_sm.jpg');

const manifest = JSON.parse(fs.readFileSync(path.join(SITE, 'LICENSE-MANIFEST.json'), 'utf8'));
const html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
const SCENES = eval(html.match(/const SCENES = (\[[\s\S]*?\n\]);/)[1]);
const NOW_POS = eval('(' + html.match(/const NOW_POS = (\{[\s\S]*?\n\});/)[1] + ')');

const chartScenes = SCENES.filter(s => s.img); // 19 scenes; the "now" scene has img: null
const byKey = Object.fromEntries(manifest.images.map(e => [e.key, e]));

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function posOf(key) {
  const m = (NOW_POS[key] || '50% 72%').match(/(\d+)%\s+(\d+)%/);
  return { x: +m[1], y: +m[2] };
}

/* object-fit: cover + object-position semantics */
async function coverCrop(imgPath, cw, ch, posX, posY) {
  const meta = await sharp(imgPath).metadata();
  const s = Math.max(cw / meta.width, ch / meta.height);
  const w = Math.max(cw, Math.round(meta.width * s));
  const h = Math.max(ch, Math.round(meta.height * s));
  const left = Math.round((w - cw) * posX / 100);
  const top = Math.round((h - ch) * posY / 100);
  return sharp(imgPath)
    .resize(w, h, { fit: 'fill', kernel: 'lanczos3' })
    .extract({ left, top, width: cw, height: ch })
    .toBuffer();
}

function overlaySvg(W, H, barH, fs, pad, labelThen, labelNow, leftText, rightText) {
  const pill = (label, x, anchorEnd) => {
    const charW = fs * 0.6;
    const pw = Math.ceil(label.length * charW) + fs;
    const ph = fs + 12;
    const px = anchorEnd ? x - pw : x;
    const tx = px + pw / 2;
    const ty = pad + ph / 2 + fs * 0.35;
    return `<rect x="${px}" y="${pad}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="rgba(0,0,0,0.55)"/>` +
      `<text x="${tx}" y="${ty}" font-family="Liberation Sans, sans-serif" font-size="${fs}" font-weight="bold" fill="#fff" text-anchor="middle">${esc(label)}</text>`;
  };
  const barTy = H - barH / 2 + fs * 0.35;
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect x="${W / 2 - 1}" y="0" width="2" height="${H}" fill="rgba(255,255,255,0.85)"/>` +
    `<rect x="0" y="${H - barH}" width="${W}" height="${barH}" fill="rgba(0,0,0,0.55)"/>` +
    `<text x="${pad}" y="${barTy}" font-family="Liberation Sans, sans-serif" font-size="${fs}" fill="#fff">${esc(leftText)}</text>` +
    `<text x="${W - pad}" y="${barTy}" font-family="Liberation Sans, sans-serif" font-size="${fs}" font-weight="bold" fill="#d8a24a" text-anchor="end">${esc(rightText)}</text>` +
    pill(labelThen, pad) +
    pill(labelNow, W - pad, true) +
    `</svg>`
  );
}

async function compose(chartPath, pos, W, H, leftText, rightText) {
  const half = W / 2;
  const barH = Math.min(40, Math.round(H * 0.037));
  const fs = Math.round(barH * 0.5);
  const pad = Math.round(W * 0.0125);
  const leftBuf = await coverCrop(chartPath, half, H, 50, 50);
  const rightBuf = await coverCrop(SAT, half, H, pos.x, pos.y);
  const svg = overlaySvg(W, H, barH, fs, pad, 'Then', 'Now', leftText, rightText);
  const base = sharp({ create: { width: W, height: H, channels: 3, background: '#0b1626' } })
    .composite([
      { input: leftBuf, left: 0, top: 0 },
      { input: rightBuf, left: half, top: 0 },
      { input: svg, left: 0, top: 0 }
    ]);
  return { base, encode: q => base.clone().jpeg({ quality: q }).toBuffer() };
}

async function encodeStill(chartPath, key, W, H, capBytes) {
  const m = byKey[key];
  const pos = posOf(key);
  const leftText = `${m.title} · ${m.author} · ${m.year}`;
  const { encode } = await compose(chartPath, pos, W, H, leftText, 'charts.marespot.com');
  let q = 82;
  let buf = await encode(q);
  while (capBytes && buf.length > capBytes && q > 50) { q -= 2; buf = await encode(q); }
  return buf;
}

function pressPage() {
  const stills = chartScenes.map(s => {
    const m = byKey[s.id];
    return `    <figure>
      <a href="/#chart=${s.id}"><img src="${s.id}-then-now.jpg" alt="${esc(m.title)} — then and now" width="1920" height="1080" loading="lazy"></a>
      <figcaption><a href="/#chart=${s.id}">${esc(m.title)}</a> · ${esc(m.author)} · ${esc(m.year)} — ${esc(m.license)} · <a href="${esc(m.source_url)}">source</a></figcaption>
    </figure>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Press kit — Adriatic Then &amp; Now</title>
<meta name="description" content="Share assets for charts.marespot.com: side-by-side stills of twenty public-domain Adriatic charts vs a NASA satellite view, with credits and suggested titles.">
<link rel="canonical" href="https://charts.marespot.com/press/">
<style>
  :root { --bg:#0b1626; --panel:#101d33; --line:#1d2c47; --text:#e8edf5; --muted:#8fa0b8; --accent:#d8a24a; --serif:"Fraunces",Georgia,serif; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font:16px/1.6 system-ui,-apple-system,sans-serif; }
  header { text-align:center; padding:36px 16px 8px; }
  h1 { font:italic 600 clamp(28px,5vw,44px)/1.15 var(--serif); }
  header p { color:var(--muted); max-width:720px; margin:10px auto 0; font-size:15px; }
  main { max-width:1080px; margin:0 auto; padding:0 16px 48px; }
  section { margin-top:36px; }
  h2 { font:italic 600 24px/1.3 var(--serif); margin-bottom:12px; }
  p.lede { color:var(--muted); max-width:760px; }
  .assets { display:flex; flex-wrap:wrap; gap:10px; }
  .assets a { background:var(--panel); border:1px solid var(--line); color:var(--muted); padding:9px 16px; border-radius:8px; font-size:14px; text-decoration:none; }
  .assets a:hover { color:var(--text); border-color:var(--accent); }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
  figure { background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  figure img { display:block; width:100%; height:auto; }
  figcaption { padding:10px 12px; font-size:12.5px; color:var(--muted); line-height:1.5; }
  figcaption a { color:var(--text); }
  ul.titles li { color:var(--muted); margin:6px 0 6px 20px; font-size:15px; }
  blockquote { background:var(--panel); border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:8px; padding:16px 18px; color:var(--muted); font-size:15px; max-width:820px; }
  footer { text-align:center; padding:28px 16px 44px; color:#5f7290; font-size:14px; border-top:1px solid var(--line); }
  footer a { color:var(--muted); }
  footer b { color:var(--muted); font-weight:400; }
</style>
</head>
<body>
<header>
  <h1>Press kit</h1>
  <p>Twenty public-domain charts of the Adriatic, 1530 to satellite, draggable then/now — side-by-side stills, credits and suggested titles for posts and pitches.</p>
</header>
<main>
  <section>
    <p class="lede">Adriatic Then &amp; Now (charts.marespot.com) pairs twenty public-domain nautical charts of the Adriatic coast — from a c. 1530 Venetian isolario to British Admiralty surveys of 1877 — with a 2003 NASA satellite view of the same sea. Every pair is a draggable before/after slider with its own deep link. All images below derive only from the licensed sources in the manifest; captions are verbatim from <a href="/LICENSE-MANIFEST.json">LICENSE-MANIFEST.json</a>.</p>
  </section>
  <section>
    <h2>Hero &amp; social assets</h2>
    <div class="assets">
      <a href="hero-adriatic.jpg">hero-adriatic.jpg (1920×1080)</a>
      <a href="hero-islands.jpg">hero-islands.jpg (1920×1080)</a>
      <a href="og.jpg">og.jpg (1200×630, social card)</a>
    </div>
  </section>
  <section>
    <h2>All stills (click through to the live scene)</h2>
    <div class="grid">
${stills}
    </div>
  </section>
  <section>
    <h2>Suggested titles</h2>
    <ul class="titles">
      <li>Admiralty Chart No. 2711 of the Kvarner Gulf (1877) vs a NASA satellite view (2003) — drag the slider at charts.marespot.com</li>
      <li>Coronelli's 1697 chart of the Dalmatian islands vs the same islands from orbit</li>
      <li>Five centuries of the same coast: Venetian isolari to satellite, side by side</li>
      <li>Zadar in 1530 vs Zadar today — every chart public domain, every view verifiable</li>
      <li>20 then/now pairs of the Adriatic, 1530–2003, all public domain [OC]</li>
    </ul>
  </section>
  <section>
    <h2>Boilerplate for curators</h2>
    <blockquote>Adriatic Then &amp; Now (charts.marespot.com) pairs twenty public-domain nautical charts of the Adriatic coast, from a c. 1530 Venetian isolario to British Admiralty surveys of 1877, with a 2003 NASA satellite photograph of the same sea. Each pair is a draggable before/after slider with a shareable deep link (for example charts.marespot.com/#chart=admiralty1877). All charts are public domain or CC0; per-image credits, source institutions and source URLs are listed in the license manifest (charts.marespot.com/LICENSE-MANIFEST.json) and under every still on this page. A MareSpot experiment.</blockquote>
  </section>
</main>
<footer>
  <p><b>A MareSpot experiment — live Adriatic wind, shelter &amp; sea temperature at <a href="https://marespot.com">marespot.com</a></b></p>
</footer>
</body>
</html>
`;
}

async function main() {
  fs.mkdirSync(PRESS, { recursive: true });
  for (const f of fs.readdirSync(PRESS)) {
    if (/-then-now\.jpg$/.test(f) || /^hero-.*\.jpg$/.test(f) || f === 'og.jpg') fs.unlinkSync(path.join(PRESS, f));
  }

  const written = [];
  for (const s of chartScenes) {
    const buf = await encodeStill(path.join(SITE, s.img), s.id, 1920, 1080, 450 * 1024);
    const out = path.join(PRESS, `${s.id}-then-now.jpg`);
    fs.writeFileSync(out, buf);
    written.push(`${s.id}-then-now.jpg ${(buf.length / 1024).toFixed(0)} KB`);
  }
  fs.copyFileSync(path.join(PRESS, 'admiralty1877-then-now.jpg'), path.join(PRESS, 'hero-adriatic.jpg'));
  fs.copyFileSync(path.join(PRESS, 'isole1697-then-now.jpg'), path.join(PRESS, 'hero-islands.jpg'));
  const og = await encodeStill(path.join(SITE, 'img', 'admiralty1877_sm.jpg'), 'admiralty1877', 1200, 630, 0);
  fs.writeFileSync(path.join(PRESS, 'og.jpg'), og);
  fs.writeFileSync(path.join(PRESS, 'index.html'), pressPage());

  console.log('wrote', written.length, 'stills + 2 heroes + og.jpg + index.html');
  for (const w of written) console.log(' ', w);
  console.log('  og.jpg', (og.length / 1024).toFixed(0), 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
