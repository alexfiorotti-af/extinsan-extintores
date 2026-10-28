// QA automático: reprova sozinho. Rode `npm run check`.
// Screenshots 390/820/1440, overflow horizontal, imagem quebrada, erro de console,
// menu mobile, formulário (erro, sucesso, eventos), ferramenta de validade,
// JSON-LD válido, contraste dos pares de cor e links de contato.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from './_pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'qa');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST) || !fs.existsSync(file)) { res.writeHead(404); return res.end(fs.readFileSync(path.join(DIST, '404.html'))); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}`;

const fails = [];
const ok = (msg) => console.log('  ✓', msg);
const fail = (msg) => { console.log('  ✗', msg); fails.push(msg); };

// Contraste WCAG dos pares usados
const lum = (hex) => { const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
console.log('\nContraste');
[['#ffffff', '#d42a1f', 'branco no vermelho (CTA)'], ['#b3231a', '#f7f4ee', 'vermelho-texto no papel'], ['#b3231a', '#fffdf9', 'vermelho-texto no creme'], ['#555c6c', '#f7f4ee', 'mudo no papel'], ['#555c6c', '#efe9dd', 'mudo na areia'], ['#c9d0e3', '#0f1b3d', 'texto claro no marinho'], ['#c6f04a', '#0f1b3d', 'fotoluminescente no marinho'], ['#ffffff', '#107f43', 'branco no WhatsApp'], ['#0b7a3b', '#fffdf9', 'verde no creme'], ['#b8c0d6', '#0f1b3d', 'stats no marinho'], ['#8d97b2', '#0a1330', 'rodapé secundário'], ['#0f1b3d', '#c6f04a', 'marinho no limão']]
  .forEach(([fg, bg, label]) => { const r = ratio(fg, bg); (r >= 4.5 ? ok : fail)(`${label}: ${r.toFixed(2)}:1`); });

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const pages = ['/', ...site.services.filter((s) => s.page.enabled).map((s) => `/servicos/${s.slug}/`), '/politica-de-privacidade/', '/nao-existe/'];

for (const route of pages) {
  console.log(`\n${route}`);
  for (const width of [390, 820, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !(route === '/nao-existe/' && /404/.test(m.text()))) errors.push(m.text()); });
    await page.route(/googletagmanager|facebook|google\.com\/maps/, (r) => r.abort());
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const bad = [];
      document.querySelectorAll('body *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.hero-bg,.sr-only,.hp,.skip,.map')) bad.push(el.tagName + '.' + el.className); });
      return { scroll: document.documentElement.scrollWidth > W, bad: bad.slice(0, 5) };
    });
    (overflow.scroll || overflow.bad.length ? fail : ok)(`${width}px sem overflow horizontal${overflow.bad.length ? ' → ' + overflow.bad.join(', ') : ''}`);
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src));
    (broken.length ? fail : ok)(`${width}px imagens carregadas${broken.length ? ' → ' + broken.join(', ') : ''}`);
    const name = (route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_|_$/g, '')) + `-${width}`;
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
    (errors.length ? fail : ok)(`${width}px console limpo${errors.length ? ' → ' + errors.join(' | ') : ''}`);

    if (width === 390 && route !== '/nao-existe/') {
      await page.click('[data-menu-toggle]');
      const open = await page.isVisible('#menu a[href*="#servicos"]');
      await page.keyboard.press('Escape');
      const closed = !(await page.isVisible('#menu a[href*="#servicos"]'));
      (open && closed ? ok : fail)('menu mobile abre e fecha');
      const h1 = await page.locator('h1').count();
      (h1 === 1 ? ok : fail)(`um único h1 (${h1})`);
    }

    if (width === 390 && (route === '/' || route.startsWith('/servicos/'))) {
      // Formulário: erro e sucesso
      await page.evaluate(() => { window.open = () => null; });
      await page.locator('[data-lead-form] button[type=submit]').scrollIntoViewIfNeeded();
      await page.click('[data-lead-form] button[type=submit]');
      const errs = await page.locator('.field.has-error').count();
      (errs >= 3 ? ok : fail)(`formulário mostra erros (${errs} campos)`);
      if (route === '/') await page.screenshot({ path: path.join(OUT, 'form-erro-390.png'), clip: await page.locator('[data-lead-form]').boundingBox() });
      await page.fill('#f-nome', 'Maria da Silva');
      await page.fill('#f-tel', '(27) 99999-1234');
      await page.selectOption('#f-servico', route === '/' ? 'recarga-de-extintores' : route.split('/')[2]);
      await page.fill('#f-cidade', 'Barra de São Francisco');
      await page.selectOption('#f-tipo', { index: 1 });
      await page.click('[data-lead-form] button[type=submit]');
      const success = await page.isVisible('[data-form-success]');
      (success ? ok : fail)('formulário mostra estado de sucesso');
      const ev = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event).filter(Boolean));
      const need = ['form_start', 'form_error', 'lead_formulario', 'generate_lead', 'user_data'];
      const miss = need.filter((n) => !ev.includes(n));
      (miss.length ? fail : ok)(`eventos do formulário${miss.length ? ' faltando: ' + miss.join(', ') : ': ' + need.join(', ')}`);
      const lead = await page.evaluate(() => window.dataLayer.find((e) => e.event === 'lead_formulario'));
      (lead && lead.event_id && lead.contact_channel === 'form' && lead.form_service && lead.preferred_channel ? ok : fail)(`lead_formulario carrega event_id, serviço (${lead && lead.form_service}) e canal preferido (${lead && lead.preferred_channel})`);
      const wa = await page.getAttribute('[data-success-wa]', 'href');
      (wa && wa.includes('wa.me/5527999778853') && decodeURIComponent(wa).includes('Maria da Silva') ? ok : fail)('mensagem do WhatsApp montada com o pedido');
      if (route === '/') await page.screenshot({ path: path.join(OUT, 'form-sucesso-390.png'), clip: await page.locator('[data-lead-form]').boundingBox() });

      // Clique de contato
      await page.evaluate(() => { document.querySelector('.wa-float').addEventListener('click', (e) => e.preventDefault()); });
      await page.click('.wa-float');
      const c = await page.evaluate(() => window.dataLayer.filter((e) => e.event === 'lead_contact').pop());
      (c && c.contact_channel === 'whatsapp' && c.contact_location === 'floating-button' ? ok : fail)('botão flutuante dispara lead_contact (whatsapp / floating-button)');
    }

    if (width === 390 && route === '/') {
      await page.locator('[data-validity] button').scrollIntoViewIfNeeded();
      await page.selectOption('#v-ano', { index: 3 });
      await page.click('[data-validity] button');
      const txt = await page.textContent('[data-validity-result] strong');
      (txt && /Vencido/.test(txt) ? ok : fail)(`ferramenta de validade: "${txt}"`);
      await page.screenshot({ path: path.join(OUT, 'validade-390.png'), clip: await page.locator('[data-validity]').boundingBox() });
    }

    if (width === 1440) {
      const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
      try {
        const types = ld.flatMap((t) => JSON.parse(t)['@graph'].map((n) => [].concat(n['@type']).join('+')));
        ok(`JSON-LD válido: ${types.join(', ')}`);
      } catch (e) { fail('JSON-LD inválido: ' + e.message); }
      const links = await page.evaluate(() => ({ tel: document.querySelectorAll('a[href^="tel:"]').length, wa: document.querySelectorAll('a[href*="wa.me"]').length, mail: document.querySelectorAll('a[href^="mailto:"]').length }));
      ok(`links de contato: ${links.tel} tel · ${links.wa} WhatsApp · ${links.mail} e-mail`);
    }
    await ctx.close();
  }
}

// Arquivos públicos
console.log('\nArquivos públicos');
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'favicon.svg', 'assets/img/og.png']) (fs.existsSync(path.join(DIST, f)) ? ok : fail)(f);
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const n = (sm.match(/<loc>/g) || []).length;
(n === site.services.filter((s) => s.page.enabled).length + 2 ? ok : fail)(`sitemap com ${n} URLs`);

await browser.close();
server.close();
console.log(fails.length ? `\n✗ ${fails.length} falha(s)` : '\n✓ QA aprovado');
process.exit(fails.length ? 1 : 0);
