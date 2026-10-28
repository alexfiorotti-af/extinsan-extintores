// Rastreamento: um listener, todos os eventos.
// Pergunta que todo site da esteira responde: qual canal traz cliente?
//   lead_contact     → clique em WhatsApp / ligação / e-mail (contact_channel + contact_location)
//   lead_formulario  → envio do formulário (evento personalizado) + generate_lead (GA4) + Lead (Meta)
//   cta_click / outbound_click / ferramenta_validade → apoio
// Scripts de terceiros só carregam na 1ª interação ou ociosidade; eventos ficam na fila até lá.
(function () {
  var cfgEl = document.getElementById('site-config');
  var CFG = cfgEl ? JSON.parse(cfgEl.textContent) : { tracking: {} };
  var T = CFG.tracking || {};
  window.dataLayer = window.dataLayer || [];

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  function cookie(name) { var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }

  // ID first-party persistente (matching de servidor / CAPI)
  var externalId = store('ext_eid');
  if (!externalId) { externalId = uuid(); store('ext_eid', externalId); }

  // Click ids e UTMs: captura na 1ª visita, guarda para o lead
  var qs = new URLSearchParams(location.search);
  var keys = ['gclid', 'wbraid', 'gbraid', 'fbclid', 'msclkid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var attr = {};
  try { attr = JSON.parse(store('ext_attr') || '{}'); } catch (e) { attr = {}; }
  var changed = false;
  keys.forEach(function (k) { var v = qs.get(k); if (v) { attr[k] = v; changed = true; } });
  if (changed) { attr.landing = location.pathname; attr.ts = Date.now(); store('ext_attr', JSON.stringify(attr)); }
  function fbc() {
    var c = cookie('_fbc');
    if (c) return c;
    return attr.fbclid ? 'fb.1.' + (attr.ts || Date.now()) + '.' + attr.fbclid : '';
  }

  /* ---------- carregamento tardio das tags ---------- */
  var loaded = false;
  var queue = [];
  function inject(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadTags() {
    if (loaded) return; loaded = true;
    // Com GTM, as tags vivem no container: aqui só alimentamos o dataLayer.
    if (!T.gtmId && (T.ga4Id || T.googleAdsId)) {
      window.gtag = window.gtag || function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      if (T.ga4Id) gtag('config', T.ga4Id, { user_id: undefined });
      if (T.googleAdsId) gtag('config', T.googleAdsId, { allow_enhanced_conversions: true });
      inject('https://www.googletagmanager.com/gtag/js?id=' + (T.ga4Id || T.googleAdsId));
    }
    if (!T.gtmId && T.metaPixelId) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      fbq('init', T.metaPixelId, { external_id: externalId });
      fbq('track', 'PageView');
    }
    queue.splice(0).forEach(function (fn) { fn(); });
  }
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, loadTags, { once: true, passive: true });
  });
  if ('requestIdleCallback' in window) requestIdleCallback(function () { setTimeout(loadTags, 2500); }, { timeout: 5000 });
  else setTimeout(loadTags, 4000);

  /* ---------- API pública ---------- */
  function base() {
    return { page_type: CFG.pageType, page_slug: CFG.pageSlug, service: CFG.service || undefined };
  }
  // name: evento GA4/dataLayer · meta: { std: 'Lead'|'Contact', custom: 'LeadFormulario' } · ads: true dispara conversão de Ads
  function track(name, params, meta, ads) {
    var eventId = uuid();
    var payload = Object.assign({ event: name, event_id: eventId, external_id: externalId }, base(), params || {});
    window.dataLayer.push(payload);
    var send = function () {
      if (!T.gtmId && window.gtag) {
        var p = Object.assign({}, payload); delete p.event;
        gtag('event', name, p);
        if (ads && T.googleAdsId && T.googleAdsLeadLabel) gtag('event', 'conversion', { send_to: T.googleAdsId + '/' + T.googleAdsLeadLabel, transaction_id: eventId });
      }
      if (!T.gtmId && window.fbq && meta) {
        var fp = Object.assign({}, params || {}, base());
        if (meta.std) fbq('track', meta.std, fp, { eventID: eventId });
        if (meta.custom) fbq('trackCustom', meta.custom, fp, { eventID: eventId + '-c' });
      }
    };
    loaded ? send() : queue.push(send);
    return eventId;
  }

  window.ExtTrack = {
    cfg: CFG, track: track, externalId: externalId, attribution: function () { return Object.assign({}, attr, { fbc: fbc(), fbp: cookie('_fbp') }); },
    loadTags: loadTags,
    setUserData: function (ud) {
      // Advanced matching (Meta) + enhanced conversions (Google Ads). Dados já normalizados.
      var fn = function () {
        if (!T.gtmId && window.fbq && T.metaPixelId) fbq('init', T.metaPixelId, Object.assign({ external_id: externalId }, ud.meta));
        if (!T.gtmId && window.gtag) gtag('set', 'user_data', ud.google);
      };
      window.dataLayer.push({ event: 'user_data', user_data: ud.google });
      loaded ? fn() : queue.push(fn);
    }
  };

  /* ---------- delegação de cliques ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var kind = el.getAttribute('data-track');
    var loc = el.getAttribute('data-location') || '';
    if (kind === 'contact') {
      var ch = el.getAttribute('data-channel');
      track('lead_contact', { contact_channel: ch, contact_location: loc, link_url: el.href }, { std: 'Contact', custom: 'LeadContato' }, ch === 'whatsapp');
    } else if (kind === 'cta') {
      track('cta_click', { cta_location: loc });
    } else if (kind === 'outbound') {
      track('outbound_click', { link_location: loc, link_url: el.href });
    }
  }, true);
})();
