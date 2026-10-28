// Gera favicon PNG, ícones do manifest, logo.png e a imagem de compartilhamento (og.png)
// a partir de SVG/HTML, renderizando com as fontes self-hosted. Rode: npm run assets
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, loadGlobal } from './_pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const pub = (p) => path.join(ROOT, 'public', p);
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(pub(`assets/fonts/${f}`)).toString('base64');
const fontsCss = `@font-face{font-family:'Barlow Condensed';font-weight:800;src:url(${font('barlow-condensed-latin-800-normal.woff2')})}
@font-face{font-family:'Barlow';font-weight:600;src:url(${font('barlow-latin-600-normal.woff2')})}
@font-face{font-family:'Barlow';font-weight:700;src:url(${font('barlow-latin-700-normal.woff2')})}
*{margin:0;box-sizing:border-box}body{background:transparent}`;
const favicon = fs.readFileSync(pub('favicon.svg'), 'utf8');
const logo = fs.readFileSync(pub('assets/img/logo.svg'), 'utf8');
const b = site.business;

const og = `<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Barlow;color:#fff;
 background:radial-gradient(60% 70% at 88% 18%,rgba(212,42,31,.45),transparent 70%),linear-gradient(160deg,#0f1b3d,#0a1330)">
 <div style="position:absolute;left:0;top:0;right:0;height:14px;background:repeating-linear-gradient(-45deg,#d42a1f 0 22px,#fff 22px 44px)"></div>
 <div style="position:absolute;left:72px;top:78px;display:flex;align-items:center;gap:18px;background:#fffdf9;padding:16px 26px;border-radius:18px">${logo.replace('<svg ', '<svg style="width:380px;height:auto" ')}</div>
 <div style="position:absolute;left:72px;top:232px;width:820px">
  <div style="font:800 82px/0.95 'Barlow Condensed';letter-spacing:-.5px">Recarga de extintores e Alvará do Bombeiro</div>
  <div style="font:600 30px/1.3 Barlow;color:#c9d0e3;margin-top:22px">Barra de São Francisco - ES · oficina própria na cidade</div>
 </div>
 <div style="position:absolute;left:72px;bottom:54px;display:flex;gap:16px;font:700 28px/1 Barlow">
  <span style="background:#d42a1f;padding:16px 24px;border-radius:999px">WhatsApp ${b.whatsappDisplay}</span>
  <span style="border:2px solid rgba(255,255,255,.5);padding:14px 24px;border-radius:999px">${b.phoneDisplay}</span>
 </div>
 <div style="position:absolute;right:70px;bottom:60px;width:190px;height:190px;border-radius:50%;background:#c6f04a;color:#0f1b3d;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-8deg)">
  <div style="font:800 64px/1 'Barlow Condensed'">5,0</div><div style="font:700 19px/1.1 Barlow;text-align:center">nota no<br>Google</div>
 </div>
</div>`;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, w, h, out, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><style>${fontsCss}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: pub(out), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('✓', out);
}
const sq = (n) => `<div style="width:${n}px;height:${n}px">${favicon.replace('<svg ', `<svg width="${n}" height="${n}" `)}</div>`;
await shot(sq(32), 32, 32, 'favicon-32.png', true);
await shot(sq(180), 180, 180, 'apple-touch-icon.png');
await shot(sq(192), 192, 192, 'icon-192.png');
await shot(sq(512), 512, 512, 'icon-512.png');
await shot(`<div style="width:1320px;height:256px;display:flex;align-items:center">${logo.replace('<svg ', '<svg width="1320" height="256" ')}</div>`, 1320, 256, 'assets/img/logo.png', true);
await shot(og, 1200, 630, 'assets/img/og.png');
await browser.close();

// Comprime a imagem de compartilhamento (PNG com paleta: nítido e leve)
const sharp = (await loadGlobal('sharp')).default || (await loadGlobal('sharp'));
const ogBuf = await sharp(pub('assets/img/og.png')).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();
fs.writeFileSync(pub('assets/img/og.png'), ogBuf);
console.log('✓ og.png comprimida:', Math.round(ogBuf.length / 1024), 'KB');
