// Interações da página: header, menu, barra fixa, mapa sob demanda e ferramenta de validade.
(function () {
  var header = document.querySelector('[data-header]');
  var bar = document.querySelector('.sticky-bar');
  var hero = document.querySelector('.hero');
  var form = document.getElementById('orcamento');

  // Header com borda depois de rolar; barra fixa aparece depois do hero e some no formulário
  var heroOut = false, formIn = false;
  function syncBar() { if (bar) bar.classList.toggle('is-visible', heroOut && !formIn); }
  addEventListener('scroll', function () { if (header) header.classList.toggle('is-scrolled', scrollY > 8); }, { passive: true });
  if ('IntersectionObserver' in window) {
    if (hero) new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; syncBar(); }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
    else { heroOut = true; syncBar(); }
    if (form) new IntersectionObserver(function (es) { formIn = es[0].isIntersecting; syncBar(); }, { threshold: .15 }).observe(form);
  } else if (bar) bar.classList.add('is-visible');

  // Menu mobile
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', function () { if (innerWidth >= 1024) setMenu(false); });


  // Ferramenta: quando vence o extintor
  var tool = document.querySelector('[data-validity]');
  if (tool) {
    var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var now = new Date();
    var ySel = tool.querySelector('[data-years]');
    for (var y = now.getFullYear(); y >= now.getFullYear() - 6; y--) {
      var o = document.createElement('option'); o.value = y; o.textContent = y; ySel.appendChild(o);
    }
    var last = new Date(now.getFullYear(), now.getMonth() - 10, 1);
    tool.elements.mes.value = last.getMonth();
    ySel.value = last.getFullYear();
    var out = tool.querySelector('[data-validity-result]');
    tool.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = +tool.elements.mes.value, yr = +ySel.value, qtd = parseInt(tool.elements.qtd.value, 10);
      var due = new Date(yr, m + 12, 1);
      var today = new Date(now.getFullYear(), now.getMonth(), 1);
      var months = (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth());
      var dueTxt = MESES[due.getMonth()] + ' de ' + due.getFullYear();
      var state, title, text;
      if (months < 0) { state = 'late'; title = 'Vencido desde ' + dueTxt; text = 'Um extintor vencido não garante funcionamento e é motivo de autuação na vistoria. Recarregue o quanto antes.'; }
      else if (months <= 2) { state = 'soon'; title = (months === 0 ? 'Vence este mês' : 'Vence em ' + dueTxt); text = 'Faltam poucas semanas. Agende agora para não ficar sem proteção nem correr risco na fiscalização.'; }
      else { state = 'ok'; title = 'Em dia até ' + dueTxt; text = 'Confira também lacre, anel e manômetro. Se o extintor foi usado, a recarga é imediata, mesmo dentro do prazo.'; }
      var qTxt = qtd > 0 ? qtd + (qtd > 1 ? ' extintores' : ' extintor') : 'meus extintores';
      var msg = 'Olá, Extinsan! Usei a ferramenta do site: ' + qTxt + ' com última recarga em ' + MESES[m] + '/' + yr + ' (' + title.toLowerCase() + '). Quero ' + (state === 'ok' ? 'agendar a próxima recarga.' : 'um orçamento de recarga.');
      var wa = 'https://wa.me/' + ExtTrack.cfg.whatsapp + '?text=' + encodeURIComponent(msg);
      out.className = 'val-result is-' + state;
      out.innerHTML = '<strong></strong><p></p><a class="btn btn-primary btn-block" target="_blank" rel="noopener" data-track="contact" data-channel="whatsapp" data-location="validity-tool"></a>';
      out.querySelector('strong').textContent = title;
      out.querySelector('p').textContent = text;
      var a = out.querySelector('a'); a.href = wa; a.textContent = state === 'ok' ? 'Agendar a próxima recarga' : 'Pedir orçamento de recarga';
      out.hidden = false;
      if (window.ExtTrack) ExtTrack.track('ferramenta_validade', { validity_state: state, months_to_due: months, extinguisher_qty: qtd || undefined });
    });
  }
})();
