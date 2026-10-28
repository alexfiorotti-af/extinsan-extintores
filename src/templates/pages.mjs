// Templates de página. Funções puras: recebem o site.json e devolvem HTML.
import { icons, logo, heroArt } from './icons.mjs';

export const esc = (v = '') =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const digits = (s) => String(s).replace(/\D/g, '');

export const waLink = (site, text) =>
  `https://wa.me/${digits(site.business.whatsappE164)}?text=${encodeURIComponent(text || site.business.whatsappMessage)}`;

const telLink = (site) => `tel:${site.business.phoneE164}`;
const mailLink = (site, subject = 'Orçamento pelo site') => `mailto:${site.business.email}?subject=${encodeURIComponent(subject)}`;

const servicePath = (svc) => `/servicos/${svc.slug}/`;

/* ---------- blocos reutilizáveis ---------- */

const ctaWhats = (site, loc, label, text, cls = 'btn btn-primary') =>
  `<a class="${cls}" href="${esc(waLink(site, text))}" target="_blank" rel="noopener" data-track="contact" data-channel="whatsapp" data-location="${loc}">${icons.whatsapp}<span>${esc(label)}</span></a>`;

const ctaCall = (site, loc, label, cls = 'btn btn-ghost') =>
  `<a class="${cls}" href="${telLink(site)}" data-track="contact" data-channel="call" data-location="${loc}">${icons.phone}<span>${esc(label)}</span></a>`;

const header = (site, ctx) => {
  const b = site.business;
  const home = ctx.pageType === 'home' ? '' : '/';
  return `<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header" data-header>
  <div class="wrap header-in">
    <a class="brand" href="/" aria-label="${esc(b.name)} — página inicial">${logo(b.name)}</a>
    <nav class="nav" id="menu" aria-label="Principal" data-menu>
      <ul>
        <li><a href="${home}#servicos">Serviços</a></li>
        <li><a href="${home}#por-que">Por que a Extinsan</a></li>
        <li><a href="${home}#validade">Validade do extintor</a></li>
        <li><a href="${home}#faq">Dúvidas</a></li>
        <li><a href="${home}#localizacao">Onde estamos</a></li>
      </ul>
      <div class="nav-mobile-cta">
        ${ctaCall(site, 'menu', b.phoneDisplay, 'btn btn-ghost-dark')}
        ${ctaWhats(site, 'menu', 'WhatsApp', null, 'btn btn-primary')}
      </div>
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="${telLink(site)}" data-track="contact" data-channel="call" data-location="header">${icons.phone}<span>${esc(b.phoneDisplay)}</span></a>
      <a class="btn btn-primary btn-sm" href="#orcamento" data-track="cta" data-location="header">Orçamento</a>
      <button class="menu-toggle" type="button" aria-controls="menu" aria-expanded="false" data-menu-toggle><span class="sr-only">Abrir menu</span>${icons.menu}</button>
    </div>
  </div>
</header>`;
};

const footer = (site, ctx) => {
  const b = site.business;
  const a = b.address;
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="/">${logo(b.name)}</a>
      <p class="footer-slogan">“${esc(b.slogan)}”</p>
      <p class="footer-small">${esc(b.description)}</p>
    </div>
    <div>
      <h2 class="footer-h">Serviços</h2>
      <ul class="footer-list">${site.services.map((s) => `<li><a href="${servicePath(s)}">${esc(s.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-h">Contato</h2>
      <address class="footer-list">
        <p>${icons.pin}<span>${esc(a.street)} — ${esc(a.neighborhood)}<br>${esc(a.city)} - ${esc(a.state)}, ${esc(a.postalCode)}</span></p>
        <p>${icons.phone}<a href="${telLink(site)}" data-track="contact" data-channel="call" data-location="footer">${esc(b.phoneDisplay)}</a></p>
        <p>${icons.whatsapp}<a href="${esc(waLink(site))}" target="_blank" rel="noopener" data-track="contact" data-channel="whatsapp" data-location="footer">${esc(b.whatsappDisplay)}</a></p>
        <p>${icons.mail}<a href="${mailLink(site)}" data-track="contact" data-channel="email" data-location="footer">${esc(b.email)}</a></p>
      </address>
    </div>
    <div>
      <h2 class="footer-h">Horário</h2>
      <ul class="footer-list">${b.hours.map((h) => `<li>${icons.clock}<span>${esc(h.label)}: ${h.closed ? 'fechado' : `${h.opens.replace(':', 'h')} às ${h.closes.replace(':', 'h')}`}</span></li>`).join('')}</ul>
      <h2 class="footer-h">Atendimento</h2>
      <p class="footer-small">${esc(b.areaServed.join(' · '))} e região.</p>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>© ${year} ${esc(b.name)} · ${esc(b.legalName)}</p>
    <p><a href="/politica-de-privacidade/">Política de privacidade</a> · <a href="${esc(site.agency.url)}" target="_blank" rel="noopener" data-track="outbound" data-location="footer-credit">Site por ${esc(site.agency.name)}</a></p>
  </div>
</footer>
<div class="sticky-bar" aria-label="Contato rápido">
  <a href="${telLink(site)}" data-track="contact" data-channel="call" data-location="sticky-bar">${icons.phone}<span>Ligar</span></a>
  <a href="${ctx.pageType === 'home' ? '' : '/'}#orcamento" class="is-primary" data-track="cta" data-location="sticky-bar">${icons.doc}<span>Orçamento</span></a>
</div>
<a class="wa-float" href="${esc(waLink(site, ctx.waText))}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp" data-track="contact" data-channel="whatsapp" data-location="floating-button">${icons.whatsapp}<span class="wa-float-label">Fale no WhatsApp</span></a>`;
};

const stars = (n = 5) => `<span class="stars" aria-label="${n} de 5 estrelas">${icons.star.repeat(n)}</span>`;

const faqBlock = (items, id = 'faq', title = 'Perguntas frequentes', tone = 'sand') => `<section class="section tone-${tone}" id="${id}" aria-labelledby="${id}-t">
  <div class="wrap narrow">
    <p class="eyebrow">Dúvidas</p>
    <h2 class="h2" id="${id}-t">${esc(title)}</h2>
    <div class="faq">
      ${items.map((f, i) => `<details class="faq-item"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;

const formBlock = (site, ctx) => {
  const f = site.form;
  const pre = ctx.service ? ctx.service.slug : '';
  return `<section class="section tone-ink cta-section" id="orcamento" aria-labelledby="orc-t">
  <div class="wrap cta-grid">
    <div class="cta-copy">
      <p class="eyebrow eyebrow-light">Orçamento</p>
      <h2 class="h2" id="orc-t">${esc(ctx.service ? `Orçamento de ${ctx.service.name.toLowerCase()}` : f.title)}</h2>
      <p class="lead-light">${esc(f.lead)}</p>
      <ul class="channels">
        <li>${ctaWhats(site, 'contact-section', `WhatsApp ${site.business.whatsappDisplay}`, ctx.waText, 'channel')}</li>
        <li>${ctaCall(site, 'contact-section', `Ligar ${site.business.phoneDisplay}`, 'channel')}</li>
        <li><a class="channel" href="${mailLink(site)}" data-track="contact" data-channel="email" data-location="contact-section">${icons.mail}<span>${esc(site.business.email)}</span></a></li>
      </ul>
      <p class="cta-hours">${icons.clock}<span>Segunda a sexta, 7h15 às 17h30</span></p>
    </div>
    <form class="lead-form" data-lead-form novalidate>
      <div class="form-state" data-form-body>
        <div class="field">
          <label for="f-nome">Seu nome</label>
          <input id="f-nome" name="nome" autocomplete="name" required maxlength="80">
          <p class="field-error" data-error-for="nome">Informe seu nome.</p>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="f-tel">WhatsApp ou telefone</label>
            <input id="f-tel" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(27) 9 9999-9999" required>
            <p class="field-error" data-error-for="telefone">Informe um telefone com DDD.</p>
          </div>
          <div class="field">
            <label for="f-email">E-mail <span class="opt">(opcional)</span></label>
            <input id="f-email" name="email" type="email" autocomplete="email">
            <p class="field-error" data-error-for="email">Confira o e-mail.</p>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="f-servico">Serviço</label>
            <select id="f-servico" name="servico" required>
              <option value="">Selecione</option>
              ${site.services.map((s) => `<option value="${s.slug}"${s.slug === pre ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}
              <option value="outro">Outro / não sei ainda</option>
            </select>
            <p class="field-error" data-error-for="servico">Escolha um serviço.</p>
          </div>
          <div class="field">
            <label for="f-cidade">Cidade</label>
            <input id="f-cidade" name="cidade" autocomplete="address-level2" list="cidades" required>
            <datalist id="cidades">${site.business.areaServed.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
            <p class="field-error" data-error-for="cidade">Informe a cidade.</p>
          </div>
        </div>
        <div class="field">
          <label for="f-tipo">Tipo de imóvel</label>
          <select id="f-tipo" name="tipo">
            <option value="">Selecione</option>
            ${f.clientTypes.map((t) => `<option>${esc(t)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-msg">O que você precisa? <span class="opt">(opcional)</span></label>
          <textarea id="f-msg" name="mensagem" rows="3" maxlength="800" placeholder="Ex.: 6 extintores de pó ABC vencidos; recebi notificação do Bombeiro…"></textarea>
        </div>
        <fieldset class="field pref">
          <legend>Como prefere receber o retorno?</legend>
          <div class="pref-opts">
            ${f.preferredChannels.map((c, i) => `<label class="pref-opt"><input type="radio" name="contato_preferido" value="${c.value}"${i === 0 ? ' checked' : ''}><span>${esc(c.label)}</span></label>`).join('')}
          </div>
        </fieldset>
        <input type="text" name="empresa_site" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <input type="hidden" name="pagina" value="${esc(ctx.pageSlug)}">
        <button class="btn btn-primary btn-block" type="submit">Enviar pedido de orçamento</button>
        <p class="form-legal">Usamos seus dados só para responder ao pedido. <a href="/politica-de-privacidade/">Política de privacidade</a>.</p>
      </div>
      <div class="form-success" data-form-success hidden tabindex="-1">
        <div class="success-icon">${icons.check}</div>
        <h3>Pedido recebido!</h3>
        <p data-success-text>Vamos responder pelo canal que você escolheu, em horário comercial.</p>
        <a class="btn btn-primary" data-success-wa href="${esc(waLink(site))}" target="_blank" rel="noopener" data-track="contact" data-channel="whatsapp" data-location="form-success">${icons.whatsapp}<span>Agilizar pelo WhatsApp</span></a>
      </div>
    </form>
  </div>
</section>`;
};

const serviceCard = (svc, i) => `<article class="svc-card">
  <div class="svc-tag" aria-hidden="true"><span class="svc-hole"></span><span class="svc-num">${String(i + 1).padStart(2, '0')}</span></div>
  <div class="svc-icon">${icons[svc.icon] || icons.shield}</div>
  <h3 class="svc-title"><a href="${servicePath(svc)}">${esc(svc.name)}</a></h3>
  <p>${esc(svc.short)}</p>
  <ul class="ticks">${svc.bullets.map((b) => `<li>${icons.check}<span>${esc(b)}</span></li>`).join('')}</ul>
  <span class="svc-more" aria-hidden="true">Ver detalhes ${icons.arrow}</span>
</article>`;

const locationBlock = (site) => {
  const b = site.business;
  const a = b.address;
  return `<section class="section tone-paper" id="localizacao" aria-labelledby="loc-t">
  <div class="wrap loc-grid">
    <div>
      <p class="eyebrow">Onde estamos</p>
      <h2 class="h2" id="loc-t">Loja em Barra de São Francisco, atendimento em toda a região</h2>
      <dl class="nap">
        <div><dt>${icons.pin}Endereço</dt><dd>${esc(a.street)}, ${esc(a.neighborhood)}<br>${esc(a.city)} - ${esc(a.state)} · CEP ${esc(a.postalCode)}</dd></div>
        <div><dt>${icons.clock}Horário</dt><dd>${b.hours.map((h) => `${esc(h.label)}: ${h.closed ? 'fechado' : `${h.opens.replace(':', 'h')} às ${h.closes.replace(':', 'h')}`}`).join('<br>')}</dd></div>
        <div><dt>${icons.phone}Telefone</dt><dd><a href="${telLink(site)}" data-track="contact" data-channel="call" data-location="location">${esc(b.phoneDisplay)}</a></dd></div>
        <div><dt>${icons.whatsapp}WhatsApp</dt><dd><a href="${esc(waLink(site))}" target="_blank" rel="noopener" data-track="contact" data-channel="whatsapp" data-location="location">${esc(b.whatsappDisplay)}</a></dd></div>
        <div><dt>${icons.mail}E-mail</dt><dd><a href="${mailLink(site)}" data-track="contact" data-channel="email" data-location="location">${esc(b.email)}</a></dd></div>
      </dl>
      <h3 class="h4">Cidades atendidas</h3>
      <ul class="chips">${b.areaServed.map((c) => `<li>${esc(c)}</li>`).join('')}<li>e região</li></ul>
    </div>
    <div class="map-wrap">
    <div class="map">
      <iframe src="${esc(b.mapsEmbed)}" title="Mapa: ${esc(b.name)}, ${esc(a.street)}, ${esc(a.city)} - ${esc(a.state)}" width="600" height="450" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
      <a class="btn btn-primary btn-sm map-go" href="${esc(b.mapsUrl)}" target="_blank" rel="noopener" data-track="outbound" data-location="map-directions">${icons.pin}<span>Como chegar pelo Google Maps</span></a>
    </div>
  </div>
</section>`;
};

/* ---------- páginas ---------- */

export function renderHome(site) {
  const b = site.business;
  const h = site.hero;
  const ctx = { pageType: 'home', pageSlug: 'home', waText: b.whatsappMessage };
  const t = site.testimonials[0];
  const body = `${header(site, ctx)}
<main id="conteudo">
  <section class="hero tone-ink" aria-labelledby="hero-t">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow eyebrow-light">${icons.pin}<span>${esc(h.eyebrow)}</span></p>
        <h1 id="hero-t">${esc(h.title)}</h1>
        <p class="lead lead-light">${esc(h.subtitle)}</p>
        <div class="hero-ctas">
          ${ctaWhats(site, 'hero', h.ctaPrimary, null)}
          ${ctaCall(site, 'hero', h.ctaSecondary, 'btn btn-ghost')}
        </div>
        <ul class="badges">${h.badges.map((x) => `<li>${icons.check}<span>${esc(x)}</span></li>`).join('')}</ul>
      </div>
      <div class="hero-visual">${heroArt}</div>
    </div>
    <div class="wrap">
      <dl class="stats">${h.stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
    </div>
  </section>

  <section class="section tone-paper" id="servicos" aria-labelledby="svc-t">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Serviços</p>
        <h2 class="h2" id="svc-t">Tudo o que o Corpo de Bombeiros vai pedir, em um só fornecedor</h2>
        <p class="lead">Do extintor da recepção ao hidrante do galpão: a Extinsan vende, instala, recarrega, projeta e treina.</p>
      </div>
      <div class="svc-grid">${site.services.map(serviceCard).join('')}</div>
    </div>
  </section>

  <section class="section tone-ink authority" id="por-que" aria-labelledby="aut-t">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow eyebrow-light">${esc(site.authority.eyebrow)}</p>
        <h2 class="h2" id="aut-t">${esc(site.authority.title)}</h2>
        <p class="lead lead-light">${esc(site.authority.lead)}</p>
      </div>
      <div class="aut-grid">
        <ul class="aut-list">${site.authority.items.map((it) => `<li><div class="aut-icon">${icons[it.icon]}</div><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></li>`).join('')}</ul>
        <aside class="checkcard" aria-labelledby="chk-t">
          <h3 id="chk-t">Confira no seu extintor</h3>
          <p>Cinco pontos que mostram se a recarga foi feita de verdade.</p>
          <ol>
            <li><span><b>Selo do Inmetro</b> com o nome da empresa que fez o serviço</span></li>
            <li><span><b>Anel colorido</b> preso no gargalo, sem folga</span></li>
            <li><span><b>Lacre</b> intacto no gatilho</span></li>
            <li><span><b>Etiqueta</b> com data e próxima manutenção</span></li>
            <li><span><b>Ponteiro</b> do manômetro na faixa verde</span></li>
          </ol>
          ${ctaWhats(site, 'authority-checklist', 'Mandar foto do meu extintor', 'Olá! Quero mandar a foto do meu extintor para vocês conferirem se está em dia.', 'btn btn-primary btn-block')}
        </aside>
      </div>
    </div>
  </section>

  <section class="section tone-sand" id="validade" aria-labelledby="val-t">
    <div class="wrap val-grid">
      <div>
        <p class="eyebrow">Ferramenta grátis</p>
        <h2 class="h2" id="val-t">${esc(site.validityTool.title)}</h2>
        <p class="lead">${esc(site.validityTool.lead)}</p>
        <p class="small-note">Referência: manutenção com recarga em geral anual e teste hidrostático a cada 5 anos (ABNT NBR 12962). Em caso de uso, lacre rompido ou manômetro fora da faixa verde, a recarga é imediata.</p>
      </div>
      <form class="val-tool" data-validity novalidate>
        <div class="field-row">
          <div class="field">
            <label for="v-mes">Mês da última recarga</label>
            <select id="v-mes" name="mes">${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => `<option value="${i}">${m}</option>`).join('')}</select>
          </div>
          <div class="field">
            <label for="v-ano">Ano</label>
            <select id="v-ano" name="ano" data-years></select>
          </div>
        </div>
        <div class="field">
          <label for="v-qtd">Quantos extintores? <span class="opt">(opcional)</span></label>
          <input id="v-qtd" name="qtd" type="number" min="1" max="999" inputmode="numeric" placeholder="Ex.: 4">
        </div>
        <button class="btn btn-dark btn-block" type="submit">${icons.calendar}<span>Ver validade</span></button>
        <div class="val-result" data-validity-result hidden aria-live="polite"></div>
      </form>
    </div>
  </section>

  <section class="section tone-paper" id="como-funciona" aria-labelledby="how-t">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Passo a passo</p>
        <h2 class="h2" id="how-t">${esc(site.process.title)}</h2>
      </div>
      <ol class="steps">${site.process.steps.map((s, i) => `<li><span class="step-n">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    </div>
  </section>

  <section class="section tone-sand" id="avaliacoes" aria-labelledby="rev-t">
    <div class="wrap rev-grid">
      <div class="rev-score">
        <p class="eyebrow">Avaliações</p>
        <h2 class="h2" id="rev-t">${String(b.rating.value.toFixed(1)).replace('.', ',')} de 5 no Google</h2>
        ${stars(5)}
        <p>${b.rating.count} avaliações no perfil da ${esc(b.name)}.</p>
        <a class="link-arrow" href="${esc(b.reviewsUrl)}" target="_blank" rel="noopener" data-track="outbound" data-location="reviews">Ver no Google ${icons.arrow}</a>
      </div>
      <figure class="quote">
        ${stars(t.rating)}
        <blockquote><p>“${esc(t.text)}”</p></blockquote>
        <figcaption><b>${esc(t.author)}</b> · avaliação no ${esc(t.source)}</figcaption>
      </figure>
    </div>
  </section>

  ${formBlock(site, ctx)}
  ${locationBlock(site)}
  ${faqBlock(site.faq)}
</main>
${footer(site, ctx)}`;
  return { body, ctx };
}

export function renderService(site, svc) {
  const p = svc.page;
  const ctx = {
    pageType: 'service', pageSlug: svc.slug, service: svc,
    waText: `Olá, Extinsan! Vim pelo site e quero um orçamento de ${svc.name.toLowerCase()}.`
  };
  const others = site.services.filter((s) => s.slug !== svc.slug);
  const gallery = svc.photos && svc.photos.length >= 3
    ? `<section class="section tone-paper" aria-labelledby="gal-t"><div class="wrap"><h2 class="h2" id="gal-t">Trabalhos realizados</h2><div class="gallery">${svc.photos.map((ph) => `<figure><img src="${esc(ph.src)}" alt="${esc(ph.alt)}" loading="lazy" decoding="async" width="${ph.w || 800}" height="${ph.h || 600}"><figcaption>${esc(ph.caption || ph.alt)}</figcaption></figure>`).join('')}</div></div></section>`
    : '';
  const body = `${header(site, ctx)}
<main id="conteudo">
  <section class="hero hero-svc tone-ink" aria-labelledby="hero-t">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="wrap">
      <nav class="crumbs" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li><a href="/#servicos">Serviços</a></li><li aria-current="page">${esc(svc.name)}</li></ol></nav>
      <div class="svc-hero">
        <div class="svc-hero-icon">${icons[svc.icon]}</div>
        <div class="hero-copy">
          <p class="eyebrow eyebrow-light">${icons.pin}<span>Barra de São Francisco - ES e região</span></p>
          <h1 id="hero-t">${esc(p.h1)}</h1>
          <p class="lead lead-light">${esc(p.lead)}</p>
          <div class="hero-ctas">
            ${ctaWhats(site, 'hero', 'Orçamento no WhatsApp', ctx.waText)}
            ${ctaCall(site, 'hero', `Ligar ${site.business.phoneDisplay}`, 'btn btn-ghost')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section tone-paper" aria-labelledby="sobre-t">
    <div class="wrap svc-body">
      <div class="prose">
        <h2 class="h2" id="sobre-t">${esc(svc.name)}</h2>
        ${p.intro.map((t) => `<p>${esc(t)}</p>`).join('')}
      </div>
      <aside class="side-card">
        <h3>Atendimento direto</h3>
        <p>Mande fotos e o endereço pelo WhatsApp. O orçamento sai mais rápido.</p>
        ${ctaWhats(site, 'service-aside', 'Chamar no WhatsApp', ctx.waText, 'btn btn-primary btn-block')}
        ${ctaCall(site, 'service-aside', site.business.phoneDisplay, 'btn btn-ghost-dark btn-block')}
        <p class="side-hours">${icons.clock}<span>Seg. a sex., 7h15 às 17h30</span></p>
      </aside>
    </div>
  </section>

  <section class="section tone-sand" aria-label="Sinais e escopo">
    <div class="wrap two-col">
      <div class="panel panel-alert">
        <h2 class="h3">${esc(p.signsTitle)}</h2>
        <ul class="alerts">${p.signs.map((x) => `<li><span class="alert-dot" aria-hidden="true">!</span><span>${esc(x)}</span></li>`).join('')}</ul>
      </div>
      <div class="panel">
        <h2 class="h3">${esc(p.scopeTitle)}</h2>
        <ul class="ticks ticks-lg">${p.scope.map((x) => `<li>${icons.check}<span>${esc(x)}</span></li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="section tone-paper" aria-labelledby="proc-t">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">Como fazemos</p><h2 class="h2" id="proc-t">Do primeiro contato à entrega</h2></div>
      <ol class="steps steps-4">${p.process.map((s, i) => `<li><span class="step-n">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    </div>
  </section>
  ${gallery}
  ${faqBlock(p.faq, 'faq', `Dúvidas sobre ${svc.name.toLowerCase()}`)}
  ${formBlock(site, ctx)}

  <section class="section tone-paper" aria-labelledby="mais-t">
    <div class="wrap">
      <h2 class="h3" id="mais-t">Outros serviços da Extinsan</h2>
      <ul class="more-svcs">${others.map((s) => `<li><a href="${servicePath(s)}"><span class="ms-icon">${icons[s.icon]}</span><span>${esc(s.name)}</span>${icons.arrow}</a></li>`).join('')}</ul>
    </div>
  </section>
</main>
${footer(site, ctx)}`;
  return { body, ctx };
}

export function renderPrivacy(site) {
  const b = site.business;
  const ctx = { pageType: 'legal', pageSlug: 'politica-de-privacidade', waText: b.whatsappMessage };
  const body = `${header(site, ctx)}
<main id="conteudo" class="section tone-paper">
  <div class="wrap narrow prose">
    <h1 class="h2">Política de privacidade</h1>
    <p>Esta política explica como a ${esc(b.name)} trata os dados enviados por este site, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
    <h2 class="h3">Quais dados coletamos</h2>
    <p>Os dados que você informa no formulário de orçamento (nome, telefone, e-mail, cidade, tipo de imóvel e mensagem) e dados de navegação coletados por ferramentas de medição, como páginas visitadas e cliques em botões de contato.</p>
    <h2 class="h3">Para que usamos</h2>
    <p>Para responder ao seu pedido de orçamento pelo canal que você escolheu, prestar o serviço contratado e medir quais canais do site funcionam melhor. Também podemos usar dados agregados em ferramentas de anúncios (como Google e Meta) para mostrar nossos serviços a pessoas da região.</p>
    <h2 class="h3">Com quem compartilhamos</h2>
    <p>Não vendemos seus dados. Eles podem ser processados por fornecedores que operam o site e as ferramentas de medição e mensagens, sempre para as finalidades acima.</p>
    <h2 class="h3">Seus direitos</h2>
    <p>Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail <a href="mailto:${esc(b.email)}">${esc(b.email)}</a> ou pelo telefone ${esc(b.phoneDisplay)}.</p>
    <h2 class="h3">Cookies</h2>
    <p>O site pode usar cookies de medição e publicidade. Você pode bloqueá-los nas configurações do seu navegador.</p>
    <p class="small-note">Última atualização: ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.</p>
  </div>
</main>
${footer(site, ctx)}`;
  return { body, ctx };
}

export function render404(site) {
  const ctx = { pageType: '404', pageSlug: '404', waText: site.business.whatsappMessage };
  const body = `${header(site, ctx)}
<main id="conteudo" class="section tone-paper">
  <div class="wrap narrow center">
    <p class="eyebrow">Erro 404</p>
    <h1 class="h2">Esta página não existe — mas o seu extintor pode estar vencendo.</h1>
    <p class="lead">Volte para o início ou fale direto com a gente.</p>
    <div class="hero-ctas center-ctas">
      <a class="btn btn-dark" href="/">Ir para o início</a>
      ${ctaWhats(site, '404', 'WhatsApp', null)}
    </div>
  </div>
</main>
${footer(site, ctx)}`;
  return { body, ctx };
}
