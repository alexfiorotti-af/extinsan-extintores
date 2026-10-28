# Rastreamento — Extinsan

Pergunta que o site responde: **qual canal traz cliente — WhatsApp, ligação, e-mail ou formulário?**

## Configuração (`data/site.json → tracking`)

| Campo | Exemplo | Efeito |
|---|---|---|
| `gtmId` | `GTM-XXXXXXX` | Injeta o GTM no `<head>`. **Com GTM, GA4/Pixel/Ads não são injetados pelo site** — configure-os no container, lendo o `dataLayer`. |
| `ga4Id` | `G-XXXXXXXXXX` | gtag direto (sem GTM) |
| `metaPixelId` | `1234567890` | Pixel direto (sem GTM), com `external_id` e advanced matching |
| `googleAdsId` + `googleAdsLeadLabel` | `AW-123…` / `AbC…` | Conversão no envio do formulário e no clique de WhatsApp |
| `webhookUrl` | URL do n8n / Make / CRM | Recebe o lead completo em JSON (sendBeacon, `text/plain`) |

As tags de terceiros só carregam na primeira interação (toque, rolagem, tecla) ou depois de ~2,5 s ociosos. Eventos disparados antes ficam numa fila. Isso protege o Core Web Vitals.

## Eventos

### `lead_contact` — clique direto
Disparado por qualquer elemento com `data-track="contact"`.

| Parâmetro | Valores |
|---|---|
| `contact_channel` | `whatsapp` · `call` · `email` |
| `contact_location` | `hero`, `header`, `menu`, `floating-button`, `sticky-bar`, `contact-section`, `service-aside`, `location`, `footer`, `authority-checklist`, `validity-tool`, `form-success` |
| `page_type` / `page_slug` / `service` | `home` · `service` · `legal` / slug da página |
| `event_id` / `external_id` | UUID por evento (dedupe Pixel ↔ CAPI) / ID first-party persistente |

Meta: `Contact` (padrão) + `LeadContato` (personalizado). Google Ads: conversão só no canal WhatsApp.

### `lead_formulario` — **evento personalizado do formulário**
| Parâmetro | Exemplo |
|---|---|
| `form_service` / `form_service_name` | `recarga-de-extintores` / `Recarga e venda de extintores` |
| `form_city` | `Barra de São Francisco` |
| `form_client_type` | `Condomínio` |
| `preferred_channel` | `whatsapp` · `call` · `email` |
| `contact_channel` | `form` |
| `contact_location` | `form-home` · `form-service` |
| `value` / `currency` | `1` / `BRL` |

Junto saem: `generate_lead` (GA4 recomendado), Meta `Lead` (padrão) + `LeadFormulario` (personalizado), e a conversão do Google Ads.

Antes do evento, o site envia os dados do contato normalizados:
- **Meta advanced matching**: `em`, `ph` (E.164 sem `+`, ex. `5527999991234`), `fn`, `ln`, `ct`, `st=es`, `country=br`, `external_id`
- **Google enhanced conversions**: `gtag('set','user_data', …)` e evento `user_data` no `dataLayer`

### Apoio
`form_start`, `form_error` (`error_field`), `cta_click` (`cta_location`), `outbound_click`, `map_load`, `ferramenta_validade` (`validity_state` = `ok`/`soon`/`late`, `months_to_due`, `extinguisher_qty`).

## Atribuição
Na primeira visita o site guarda `gclid`, `wbraid`, `gbraid`, `fbclid`, `msclkid`, `ttclid` e `utm_*`. O `fbclid` vira `_fbc` quando o cookie não existe. Tudo vai no payload do webhook (`atribuicao`).

## Payload do webhook
```json
{
  "nome": "Maria da Silva", "telefone": "(27) 99999-1234", "telefone_e164": "5527999991234",
  "email": "", "servico": "recarga-de-extintores", "servico_nome": "Recarga e venda de extintores",
  "cidade": "Barra de São Francisco", "tipo": "Condomínio", "mensagem": "",
  "contato_preferido": "whatsapp", "pagina": "home",
  "event_id": "…", "external_id": "…",
  "atribuicao": { "utm_source": "ig", "fbclid": "…", "fbc": "fb.1.…", "fbp": "fb.1.…" },
  "url": "https://…", "user_agent": "…", "enviado_em": "2026-10-28T17:00:00.000Z"
}
```
Com o webhook no n8n, o mesmo `event_id` permite mandar o `Lead` pela Conversions API sem duplicar o evento do Pixel.

## Configuração sugerida no GA4
Marcar como evento-chave: `lead_formulario` e `lead_contact`. Criar dimensões personalizadas: `contact_channel`, `contact_location`, `form_service`, `preferred_channel`, `page_type`.
