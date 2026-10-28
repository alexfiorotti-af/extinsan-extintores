// Formulário de orçamento.
// Ao enviar: valida → evento personalizado `lead_formulario` (+ generate_lead / Lead)
// → advanced matching → webhook opcional (CRM / n8n / Make) → retorno pelo canal escolhido.
(function () {
  var form = document.querySelector('[data-lead-form]');
  if (!form || !window.ExtTrack) return;
  var CFG = window.ExtTrack.cfg;

  var strip = function (s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
  function phoneE164(raw) {
    var d = (raw || '').replace(/\D/g, '').replace(/^0+/, '');
    if (d.length === 10 || d.length === 11) d = '55' + d;
    return /^55\d{10,11}$/.test(d) ? d : '';
  }
  function setError(name, on) {
    var input = form.elements[name];
    var field = input && (input.closest ? input.closest('.field') : null);
    if (field) field.classList.toggle('has-error', on);
    if (input && input.setAttribute) input.setAttribute('aria-invalid', on ? 'true' : 'false');
  }

  var started = false;
  form.addEventListener('focusin', function () {
    if (started) return; started = true;
    window.ExtTrack.track('form_start', { form_location: 'orcamento' });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    if (f.empresa_site.value) return; // honeypot

    var data = {
      nome: f.nome.value.trim(),
      telefone: f.telefone.value.trim(),
      email: f.email.value.trim(),
      servico: f.servico.value,
      cidade: f.cidade.value.trim(),
      tipo: f.tipo.value,
      mensagem: f.mensagem.value.trim(),
      contato_preferido: (form.querySelector('input[name="contato_preferido"]:checked') || {}).value || 'whatsapp',
      pagina: f.pagina.value
    };
    var ph = phoneE164(data.telefone);
    var checks = {
      nome: data.nome.length >= 2,
      telefone: !!ph,
      email: !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email),
      servico: !!data.servico,
      cidade: data.cidade.length >= 2
    };
    if (data.contato_preferido === 'email' && !data.email) checks.email = false;
    var firstBad = null;
    Object.keys(checks).forEach(function (k) { setError(k, !checks[k]); if (!checks[k] && !firstBad) firstBad = k; });
    if (firstBad) {
      f[firstBad].focus();
      window.ExtTrack.track('form_error', { error_field: firstBad });
      return;
    }

    var serviceName = (CFG.services || {})[data.servico] || 'Outro';
    var parts = data.nome.split(/\s+/);

    // Advanced matching / enhanced conversions
    window.ExtTrack.setUserData({
      meta: { em: strip(data.email) || undefined, ph: ph, fn: strip(parts[0]), ln: strip(parts.slice(1).join(' ')) || undefined, ct: strip(data.cidade).replace(/\s+/g, ''), st: 'es', country: 'br' },
      google: { email: data.email ? data.email.toLowerCase() : undefined, phone_number: '+' + ph, address: { first_name: parts[0], last_name: parts.slice(1).join(' ') || undefined, city: data.cidade, region: 'ES', country: 'BR' } }
    });

    var leadParams = {
      form_service: data.servico,
      form_service_name: serviceName,
      form_city: data.cidade,
      form_client_type: data.tipo || 'nao_informado',
      preferred_channel: data.contato_preferido,
      contact_channel: 'form',
      contact_location: 'form-' + CFG.pageType,
      value: 1,
      currency: 'BRL'
    };
    var eventId = window.ExtTrack.track('lead_formulario', leadParams, { std: 'Lead', custom: 'LeadFormulario' }, true);
    window.ExtTrack.track('generate_lead', leadParams);

    // Webhook opcional (CRM). text/plain evita preflight de CORS.
    var hook = CFG.tracking && CFG.tracking.webhookUrl;
    if (hook) {
      var body = JSON.stringify(Object.assign({}, data, {
        telefone_e164: ph, servico_nome: serviceName, event_id: eventId, external_id: window.ExtTrack.externalId,
        atribuicao: window.ExtTrack.attribution(), url: location.href, user_agent: navigator.userAgent, enviado_em: new Date().toISOString()
      }));
      try { navigator.sendBeacon(hook, new Blob([body], { type: 'text/plain' })); } catch (err) { fetch(hook, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' }); }
    }

    // Mensagem pronta para o WhatsApp da Extinsan
    var msg = 'Olá, Extinsan! Pedido de orçamento pelo site:\n' +
      '• Nome: ' + data.nome + '\n' +
      '• Serviço: ' + serviceName + '\n' +
      '• Cidade: ' + data.cidade + '\n' +
      (data.tipo ? '• Imóvel: ' + data.tipo + '\n' : '') +
      (data.mensagem ? '• Detalhes: ' + data.mensagem + '\n' : '') +
      '• Prefiro retorno por: ' + ({ whatsapp: 'WhatsApp', call: 'ligação', email: 'e-mail' })[data.contato_preferido] + '\n' +
      '• Telefone: ' + data.telefone + (data.email ? '\n• E-mail: ' + data.email : '');
    var wa = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg);

    var body2 = form.querySelector('[data-form-body]');
    var ok = form.querySelector('[data-form-success]');
    var waBtn = ok.querySelector('[data-success-wa]');
    var txt = ok.querySelector('[data-success-text]');
    waBtn.href = wa;
    if (data.contato_preferido === 'whatsapp') {
      txt.textContent = 'Abrimos o WhatsApp com o seu pedido já escrito — é só tocar em enviar. Se não abriu, use o botão abaixo.';
      window.open(wa, '_blank', 'noopener');
    } else if (data.contato_preferido === 'call') {
      txt.textContent = 'Vamos ligar para ' + data.telefone + ' em horário comercial (seg. a sex., 7h15 às 17h30). Com pressa? Mande pelo WhatsApp.';
    } else {
      txt.textContent = 'Vamos responder no e-mail ' + data.email + '. Com pressa? Mande pelo WhatsApp.';
    }
    body2.hidden = true;
    ok.hidden = false;
    ok.focus();
  });

  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field && field.classList.contains('has-error')) field.classList.remove('has-error');
  });
})();
