// Gera o site estático em dist/ a partir de data/site.json.
// Sem dependências: `node scripts/build.mjs` (é o que a Vercel roda).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { renderHome, renderService, renderPrivacy, render404, esc, waLink } from '../src/templates/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const url = (p = '/') => new URL(p, site.siteUrl).href;
const today = new Date().toISOString().slice(0, 10);
const b = site.business;

/* ---------- limpeza e cópia de public/ ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

/* ---------- CSS e JS com hash no nome (cache imutável) ---------- */
const minCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const minJs = (js) => js
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\n\s*\n/g, '\n')
  .trim();
const hashed = (name, content) => {
  const h = crypto.createHash('sha1').update(content).digest('hex').slice(0, 10);
  const [base, ext] = name.split('.');
  const out = `/assets/${base}.${h}.${ext}`;
  fs.writeFileSync(path.join(DIST, out), content);
  return out;
};
const css = minCss(fs.readFileSync(path.join(ROOT, 'src/styles/main.css'), 'utf8'));
const cssHref = hashed('site.css', css);
const js = ['tracking.js', 'form.js', 'main.js']
  .map((f) => fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')).join('\n;\n');
const jsHref = hashed('site.js', minJs(js));

/* ---------- JSON-LD ---------- */
const DAY = { Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday' };
const bizId = url('/#empresa');
const businessNode = (full = true) => {
  const node = {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': bizId,
    name: b.name,
    legalName: b.legalName,
    slogan: b.slogan,
    description: b.description,
    url: url('/'),
    logo: url('/assets/img/logo.png'),
    image: url('/assets/img/og.png'),
    telephone: b.phoneE164,
    email: b.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${b.address.street}, ${b.address.neighborhood}`,
      addressLocality: b.address.city,
      addressRegion: b.address.state,
      postalCode: b.address.postalCode,
      addressCountry: b.address.country
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    hasMap: b.mapsUrl,
    openingHoursSpecification: b.hours.filter((h) => !h.closed).map((h) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => DAY[d]), opens: h.opens, closes: h.closes
    })),
    areaServed: b.areaServed.map((c) => ({ '@type': 'City', name: c.replace(/ \(MG\)$/, ''), containedInPlace: { '@type': 'State', name: c.endsWith('(MG)') ? 'Minas Gerais' : 'Espírito Santo' } })),
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer service', telephone: b.phoneE164, availableLanguage: 'pt-BR', areaServed: 'BR' },
      { '@type': 'ContactPoint', contactType: 'sales', telephone: b.whatsappE164, availableLanguage: 'pt-BR', areaServed: 'BR', description: 'WhatsApp' }
    ],
    sameAs: [b.mapsUrl, b.blogUrl],
    knowsAbout: ['recarga de extintores', 'manutenção de extintores ABNT NBR 12962', 'Alvará de Licença do Corpo de Bombeiros', 'projeto de incêndio', 'sistema hidráulico preventivo', 'SPDA ABNT NBR 5419', 'instalação de gás GLP', 'brigada de incêndio ABNT NBR 14276', 'sinalização de emergência ABNT NBR 13434', 'iluminação de emergência ABNT NBR 10898']
  };
  if (full) {
    node.aggregateRating = { '@type': 'AggregateRating', ratingValue: b.rating.value, reviewCount: b.rating.count, bestRating: 5 };
    node.review = site.testimonials.map((t) => ({
      '@type': 'Review', author: { '@type': 'Person', name: t.author },
      reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 }, reviewBody: t.text
    }));
    node.hasOfferCatalog = {
      '@type': 'OfferCatalog', name: 'Serviços de proteção contra incêndio',
      itemListElement: site.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@id': url(`/servicos/${s.slug}/#servico`) } }))
    };
  }
  return node;
};
const serviceNode = (s) => ({
  '@type': 'Service',
  '@id': url(`/servicos/${s.slug}/#servico`),
  name: s.name,
  serviceType: s.name,
  description: s.page.description,
  url: url(`/servicos/${s.slug}/`),
  provider: { '@id': bizId },
  areaServed: b.areaServed.map((c) => ({ '@type': 'City', name: c.replace(/ \(MG\)$/, '') }))
});
const faqNode = (items, id) => ({
  '@type': 'FAQPage', '@id': id,
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
});
const crumbs = (list) => ({
  '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(p) }))
});

/* ---------- casca HTML ---------- */
function layout({ body, ctx }, meta) {
  const t = site.tracking;
  const cfg = {
    whatsapp: b.whatsappE164.replace(/\D/g, ''),
    email: b.email,
    pageType: ctx.pageType,
    pageSlug: ctx.pageSlug,
    service: ctx.service ? ctx.service.slug : '',
    tracking: { gtmId: t.gtmId, ga4Id: t.ga4Id, metaPixelId: t.metaPixelId, googleAdsId: t.googleAdsId, googleAdsLeadLabel: t.googleAdsLeadLabel, webhookUrl: t.webhookUrl },
    services: Object.fromEntries(site.services.map((s) => [s.slug, s.name]))
  };
  const gtmHead = t.gtmId ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(t.gtmId)}');</script>` : '';
  const gtmBody = t.gtmId ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${esc(t.gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : '';
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.graph }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${meta.canonical}">
<meta name="robots" content="${meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta name="theme-color" content="#0f1b3d">
<meta name="geo.region" content="BR-ES">
<meta name="geo.placename" content="${esc(b.address.city)}">
<meta name="geo.position" content="${b.geo.lat};${b.geo.lng}">
<meta name="ICBM" content="${b.geo.lat}, ${b.geo.lng}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${site.locale}">
<meta property="og:site_name" content="${esc(b.name)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${meta.canonical}">
<meta property="og:image" content="${url('/assets/img/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(b.name)} — ${esc(b.slogan)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${url('/assets/img/og.png')}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt">
<link rel="preload" href="/assets/fonts/barlow-condensed-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${cssHref}">
${gtmHead}
<script type="application/ld+json">${ld}</script>
</head>
<body data-page-type="${ctx.pageType}" data-page-slug="${esc(ctx.pageSlug)}">
${gtmBody}
${body}
<script id="site-config" type="application/json">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>
<script src="${jsHref}" defer></script>
</body>
</html>
`;
}

const write = (rel, html) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

/* ---------- páginas ---------- */
const pages = [];

// Home
{
  const canonical = url('/');
  write('index.html', layout(renderHome(site), {
    title: site.seo.title, description: site.seo.description, canonical,
    graph: [
      businessNode(true),
      { '@type': 'WebSite', '@id': url('/#site'), url: canonical, name: b.name, inLanguage: 'pt-BR', publisher: { '@id': bizId } },
      { '@type': 'WebPage', '@id': url('/#pagina'), url: canonical, name: site.seo.title, description: site.seo.description, inLanguage: 'pt-BR', isPartOf: { '@id': url('/#site') }, about: { '@id': bizId }, dateModified: today,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#hero-t', '.hero .lead', '#faq'] } },
      crumbs([['Início', '/']]),
      faqNode(site.faq, url('/#faq')),
      ...site.services.map(serviceNode)
    ]
  }));
  pages.push({ loc: canonical, priority: '1.0', changefreq: 'monthly', images: [url('/assets/img/og.png')] });
}

// Serviços
for (const s of site.services.filter((x) => x.page && x.page.enabled)) {
  const p = `/servicos/${s.slug}/`;
  const canonical = url(p);
  write(`servicos/${s.slug}/index.html`, layout(renderService(site, s), {
    title: s.page.title, description: s.page.description, canonical,
    graph: [
      businessNode(false),
      serviceNode(s),
      { '@type': 'WebPage', '@id': `${canonical}#pagina`, url: canonical, name: s.page.title, description: s.page.description, inLanguage: 'pt-BR', isPartOf: { '@id': url('/#site') }, about: { '@id': url(`${p}#servico`) }, dateModified: today,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#hero-t', '.hero .lead', '.prose'] } },
      crumbs([['Início', '/'], ['Serviços', '/#servicos'], [s.name, p]]),
      faqNode(s.page.faq, `${canonical}#faq`)
    ]
  }));
  pages.push({ loc: canonical, priority: '0.9', changefreq: 'monthly', images: (s.photos || []).map((ph) => url(ph.src)) });
}

// Privacidade e 404
write('politica-de-privacidade/index.html', layout(renderPrivacy(site), {
  title: `Política de privacidade | ${b.name}`, description: `Como a ${b.name} trata os dados enviados pelo site.`,
  canonical: url('/politica-de-privacidade/'), graph: [businessNode(false), crumbs([['Início', '/'], ['Política de privacidade', '/politica-de-privacidade/']])]
}));
pages.push({ loc: url('/politica-de-privacidade/'), priority: '0.2', changefreq: 'yearly', images: [] });
write('404.html', layout(render404(site), {
  title: `Página não encontrada | ${b.name}`, description: site.seo.description, canonical: url('/'), robots: 'noindex, follow', graph: [businessNode(false)]
}));

/* ---------- sitemap.xml ---------- */
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map((pg) => `  <url>
    <loc>${pg.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${pg.changefreq}</changefreq>
    <priority>${pg.priority}</priority>${pg.images.map((im) => `
    <image:image><image:loc>${im}</image:loc></image:image>`).join('')}
  </url>`).join('\n')}
</urlset>
`);

/* ---------- robots.txt (libera buscadores e IA, treino e citação) ---------- */
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'GoogleOther', 'Applebot', 'Applebot-Extended', 'Bingbot', 'meta-externalagent', 'meta-externalfetcher', 'FacebookBot', 'CCBot', 'MistralAI-User', 'cohere-ai', 'cohere-training-data-crawler', 'Amazonbot', 'Bytespider', 'DuckAssistBot', 'YouBot', 'PhindBot', 'Diffbot', 'AI2Bot', 'Timpibot', 'ImagesiftBot'];
write('robots.txt', `# ${b.name} — buscadores e assistentes de IA são bem-vindos.
User-agent: *
Allow: /

${aiBots.map((u) => `User-agent: ${u}\nAllow: /`).join('\n\n')}

Sitemap: ${url('/sitemap.xml')}
`);

/* ---------- llms.txt (briefing para motores generativos) ---------- */
const hoursTxt = b.hours.map((h) => `${h.label}: ${h.closed ? 'fechado' : `${h.opens} às ${h.closes}`}`).join('; ');
write('llms.txt', `# ${b.name}

> ${b.description}

Como citar: "${b.name}, empresa de prevenção e combate a incêndio em ${b.address.city} - ES (${b.phoneDisplay}, ${url('/')})."

## Dados do negócio
- Nome: ${b.name} (${b.legalName})
- Categoria: ${b.category}
- Endereço: ${b.address.street}, ${b.address.neighborhood}, ${b.address.city} - ${b.address.state}, CEP ${b.address.postalCode}
- Telefone: ${b.phoneDisplay}
- WhatsApp: ${b.whatsappDisplay} — ${waLink(site)}
- E-mail: ${b.email}
- Horário: ${hoursTxt}
- Área de atendimento: ${b.areaServed.join(', ')} e região
- Avaliação no Google: ${b.rating.value} de 5 (${b.rating.count} avaliações)
- Empresa do mesmo grupo: ${b.sister.name} — ${b.sister.role}
- Slogan: "${b.slogan}"

## Serviços
${site.services.map((s) => `- [${s.name}](${url(`/servicos/${s.slug}/`)}): ${s.short}`).join('\n')}

## Diferenciais
${site.authority.items.map((i) => `- ${i.title}: ${i.text}`).join('\n')}

## Perguntas frequentes
${site.faq.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

${site.services.map((s) => `## ${s.name}\n${s.page.intro.join('\n\n')}\n\n${s.page.faq.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}`).join('\n\n')}
`);

/* ---------- manifest ---------- */
write('site.webmanifest', JSON.stringify({
  name: b.name, short_name: 'Extinsan', lang: 'pt-BR', start_url: '/', display: 'standalone',
  background_color: '#f7f4ee', theme_color: '#0f1b3d',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2));

const count = fs.readdirSync(DIST, { recursive: true }).filter((f) => f.endsWith('.html')).length;
console.log(`✓ build: ${count} páginas HTML · css ${cssHref} · js ${jsHref}`);
