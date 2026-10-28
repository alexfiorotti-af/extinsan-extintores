# Extinsan Extintores — site

Site da **Extinsan Extintores** (Barra de São Francisco - ES): recarga e venda de extintores, projeto de incêndio e Alvará do Corpo de Bombeiros, SHP, para-raios (SPDA), gás GLP, brigada de incêndio e sinalização de emergência.

HTML estático puro, gerado a partir de **um único arquivo de conteúdo** (`data/site.json`). Sem framework no navegador e sem dependências no build — a Vercel roda `node scripts/build.mjs` e publica `dist/`.

---

## Diretório de arquivos

```
extinsan-extintores/
├── data/
│   └── site.json              ← ÚNICA fonte de conteúdo (NAP, serviços, FAQ, rastreamento)
├── src/
│   ├── templates/
│   │   ├── pages.mjs          ← home, páginas de serviço, privacidade, 404
│   │   └── icons.mjs          ← ícones SVG, marca e ilustração do hero
│   ├── styles/main.css        ← design system (tokens no :root = identidade da marca)
│   └── js/
│       ├── tracking.js        ← dataLayer, GA4, Meta Pixel, Google Ads, IDs first-party
│       ├── form.js            ← formulário + evento personalizado lead_formulario + webhook
│       └── main.js            ← menu, barra fixa, mapa sob demanda, ferramenta de validade
├── public/                    ← copiado como está para dist/
│   ├── favicon.svg · favicon-32.png · apple-touch-icon.png · icon-192/512.png
│   └── assets/
│       ├── fonts/             ← Barlow + Barlow Condensed (woff2, self-hosted)
│       └── img/               ← logo.svg, logo.png, og.png (+ fotos dos serviços)
├── scripts/
│   ├── build.mjs              ← gera páginas, JSON-LD, sitemap.xml, robots.txt, llms.txt, manifest
│   ├── assets.mjs             ← gera ícones PNG, logo.png e og.png (npm run assets)
│   ├── check.mjs              ← QA automático com screenshots (npm run check)
│   └── _pw.mjs                ← carrega Playwright/sharp locais ou globais
├── docs/
│   └── RASTREAMENTO.md        ← eventos, parâmetros e como configurar GTM/GA4/Meta
├── vercel.json                ← build, cache imutável em /assets, headers de segurança
└── dist/                      ← saída do build (não versionada)
```

## Páginas geradas

| URL | Conteúdo |
|---|---|
| `/` | Home: hero, 7 serviços, autoridade, ferramenta de validade, passos, avaliação, orçamento, localização, FAQ |
| `/servicos/recarga-de-extintores/` | Recarga e venda de extintores |
| `/servicos/projeto-de-incendio-alvara-bombeiros/` | Projeto de incêndio e Alvará do Corpo de Bombeiros |
| `/servicos/sistema-hidraulico-preventivo-shp/` | SHP — hidrantes e mangotinhos |
| `/servicos/para-raios-spda/` | Para-raios (SPDA) e laudos |
| `/servicos/instalacao-de-gas-glp/` | Projeto e instalação de gás GLP |
| `/servicos/curso-brigada-de-incendio/` | Curso de brigada de incêndio |
| `/servicos/sinalizacao-e-iluminacao-de-emergencia/` | Placas fotoluminescentes e iluminação de emergência |
| `/politica-de-privacidade/` | LGPD |
| `/sitemap.xml` · `/robots.txt` · `/llms.txt` | SEO e GEO |

Cada página de serviço tem hero próprio, breadcrumb, `Service` + `FAQPage` + `BreadcrumbList` no JSON-LD, canonical, entrada no sitemap, bloco no `llms.txt` e formulário com o serviço pré-selecionado. Para desligar uma página: `services[].page.enabled = false`.

## Comandos

```bash
npm run build    # gera dist/ (sem instalar nada)
npm run dev      # build + servidor local em http://localhost:4321
npm run assets   # regenera ícones, logo.png e og.png (precisa de playwright e sharp)
npm run check    # build + QA: 390/820/1440 px, overflow, console, menu, formulário, eventos, JSON-LD, contraste
```

## Publicar na Vercel

1. Vercel → **Add New Project** → importar `alexfiorotti-af/extinsan-extintores`.
2. Framework: **Other**. O `vercel.json` já define build e pasta de saída.
3. Se o projeto não se chamar `extinsan-extintores`, troque `siteUrl` em `data/site.json`.
4. Quando houver domínio próprio: troque `siteUrl`, adicione o domínio na Vercel e inclua no `vercel.json` a regra de `X-Robots-Tag: noindex` para o host `*.vercel.app`.

## Rastreamento

Preencha `data/site.json → tracking` (vazio = tag não injetada). Detalhes em [`docs/RASTREAMENTO.md`](docs/RASTREAMENTO.md).

## Pendências com o cliente

A lista está em `data/site.json → _toConfirmWithClient` (endereço 812 × 1165, WhatsApp oficial, credenciamento, cidades, domínio, logo em vetor, fotos).

### Fotos

O site foi entregue **sem fotos**, com ilustrações próprias, porque o perfil do Google não traz imagens utilizáveis. Quando chegarem, siga o padrão `servico-descricao-cidade.jpg`, coloque em `public/assets/img/servicos/` e liste em `services[].photos` (`src`, `alt`, `caption`, `w`, `h`). Com 3 ou mais fotos, a galeria aparece sozinha na página do serviço.
