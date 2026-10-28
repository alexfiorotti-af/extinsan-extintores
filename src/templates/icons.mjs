// Ícones e ilustrações em SVG inline. Traço de 1.75 em currentColor:
// herdam a cor do contexto e não custam requisição.

const s = (body, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  extinguisher: s('<path d="M9 7h5a2 2 0 0 1 2 2v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9a2 2 0 0 1 2-2Z"/><path d="M10 7V4.5h3V7"/><path d="M13 4.5h3.5L19 3"/><path d="M7 11H5.5a1.5 1.5 0 0 0-1.5 1.5V17"/><path d="M7 13h9"/>'),
  blueprint: s('<path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 17v-5l3-2 3 2v5"/><path d="M10 17v-2h2v2"/>'),
  hydrant: s('<path d="M8 21h8"/><path d="M9 21V10h6v11"/><path d="M7 10h10"/><path d="M9 10a3 3 0 0 1 6 0"/><path d="M12 5V3.5"/><path d="M6 14h3M15 14h3"/>'),
  bolt: s('<path d="M13 2 5 13h6l-1 9 8-11h-6z"/>'),
  gas: s('<path d="M8 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"/><path d="M9.5 8V5.5h5V8"/><path d="M11 3.5h2"/><path d="M6 14h12"/>'),
  helmet: s('<path d="M3 17h18"/><path d="M4.5 17a7.5 7.5 0 0 1 15 0"/><path d="M12 9.5V6"/><path d="M9.5 6h5"/><path d="M10 13l2-2 2 2"/>'),
  exit: s('<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><circle cx="9" cy="8.6" r="1.2"/><path d="m8.5 10.5-1.6 3.4M8.5 10.5l2 1.5 1.5-1M8 12.4l1.4 2.6M6.9 13.9 5.5 15"/><path d="M14 12h5m-2-2 2 2-2 2"/>'),
  workshop: s('<path d="M3 21V9l9-6 9 6v12"/><path d="M8 21v-7h8v7"/><path d="M8 17h8"/>'),
  seal: s('<circle cx="12" cy="10" r="6"/><path d="m9.5 10 1.8 1.8 3.2-3.6"/><path d="M8.5 15.2 7 21l5-2.5 5 2.5-1.5-5.8"/>'),
  person: s('<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="m15 14 1.5 1.5L20 12"/>'),
  doc: s('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 15h7M9 18h4"/>'),
  price: s('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
  shield: s('<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  phone: s('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  mail: s('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  pin: s('<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>'),
  clock: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
  menu: s('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  calendar: s('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  whatsapp: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3Zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.7c0-5.8 4.8-10.5 10.8-10.5s10.8 4.7 10.8 10.5S22 26.4 16 26.4Zm5.9-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.8.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.4 2.4 3.6 5.8 5c2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4Z"/></svg>'
};

// Marca: o "telhado" do logo original com um extintor dentro.
export const logoMark = `<svg class="mark" viewBox="0 0 64 52" aria-hidden="true" focusable="false">
  <path d="M32 2 2 50h60z" fill="var(--c-ink)"/>
  <path d="M32 13 11.5 46h41z" fill="#fff"/>
  <path d="M32 19 16 44h32z" fill="var(--c-red)"/>
  <rect x="28.4" y="27" width="7.2" height="15" rx="2.2" fill="#fff"/>
  <rect x="30.2" y="23.6" width="3.6" height="3.8" fill="#fff"/>
  <path d="M33.6 24.6h4.6l2.2-1.6" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>`;

export const logo = (brand) => `<span class="logo">${logoMark}<span class="logo-text"><span class="logo-name">EXTINSAN</span><span class="logo-sub">Extintores · B. S. Francisco</span></span></span><span class="sr-only">${brand}</span>`;

// Ilustração do hero: extintor com etiqueta de inspeção (a "ficha" que o fiscal confere).
export const heroArt = `<svg class="hero-art" viewBox="0 0 420 460" role="img" aria-labelledby="ha-t">
  <title id="ha-t">Extintor de incêndio com etiqueta de inspeção em dia</title>
  <defs>
    <linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#9c1a12"/><stop offset=".35" stop-color="#e2392c"/><stop offset=".55" stop-color="#f05a4b"/><stop offset="1" stop-color="#a41d14"/></linearGradient>
    <linearGradient id="glow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--c-glow)" stop-opacity=".55"/><stop offset="1" stop-color="var(--c-glow)" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse cx="170" cy="438" rx="120" ry="14" fill="#000" opacity=".28"/>
  <g>
    <rect x="102" y="130" width="136" height="300" rx="40" fill="url(#cyl)"/>
    <rect x="102" y="232" width="136" height="88" fill="#fff" opacity=".96"/>
    <text x="170" y="266" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="30" fill="#0f1b3d">PÓ ABC</text>
    <text x="170" y="296" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="600" font-size="15" fill="#5b6272">6 kg · 2A:20B:C</text>
    <rect x="148" y="96" width="44" height="40" rx="6" fill="#20283d"/>
    <path d="M148 98h-26a14 14 0 0 0-14 14v8" stroke="#20283d" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M192 104h48l34-20" stroke="#20283d" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="170" cy="82" r="26" fill="#f4f1ea" stroke="#20283d" stroke-width="6"/>
    <path d="M152 86a19 19 0 0 1 36 0" stroke="var(--c-trust)" stroke-width="7" fill="none"/>
    <path d="M170 82l9-10" stroke="#20283d" stroke-width="4" stroke-linecap="round"/>
    <path d="M108 150v-30" stroke="#20283d" stroke-width="10" stroke-linecap="round"/>
    <path d="M108 150c-30 30-40 120-12 196" stroke="#20283d" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="86" y="338" width="20" height="34" rx="5" fill="#20283d"/>
    <rect x="150" y="128" width="40" height="10" rx="3" fill="var(--c-glow)"/>
  </g>
  <g class="tag">
    <path d="M222 168l60-34" stroke="#c9c2b4" stroke-width="2"/>
    <g transform="rotate(8 330 230)">
      <rect x="268" y="128" width="128" height="214" rx="10" fill="#fff" stroke="#ddd6c8" stroke-width="2"/>
      <circle cx="332" cy="146" r="7" fill="none" stroke="#c9c2b4" stroke-width="2"/>
      <rect x="268" y="160" width="128" height="34" fill="var(--c-ink)"/>
      <text x="332" y="183" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="17" fill="#fff" letter-spacing="1">INSPEÇÃO</text>
      <g font-family="Barlow, sans-serif" font-size="11" font-weight="700" fill="#0f1b3d" text-anchor="middle">
        <text x="290" y="216">J</text><text x="312" y="216">F</text><text x="334" y="216">M</text><text x="356" y="216">A</text><text x="378" y="216">M</text>
        <text x="290" y="240">J</text><text x="312" y="240">J</text><text x="334" y="240">A</text><text x="356" y="240">S</text><text x="378" y="240">O</text>
      </g>
      <circle cx="356" cy="236" r="10" fill="none" stroke="var(--c-red)" stroke-width="2.5"/>
      <text x="282" y="272" font-family="Barlow, sans-serif" font-size="10" font-weight="600" fill="#5b6272">PRÓXIMA RECARGA</text>
      <text x="282" y="296" font-family="Barlow Condensed, sans-serif" font-size="24" font-weight="800" fill="var(--c-trust)">EM DIA</text>
      <rect x="282" y="310" width="100" height="18" rx="9" fill="var(--c-sand)"/>
      <text x="332" y="323" text-anchor="middle" font-family="Barlow, sans-serif" font-size="9.5" font-weight="700" fill="#0f1b3d">SELO · ANEL · LACRE</text>
    </g>
  </g>
</svg>`;
