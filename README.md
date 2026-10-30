# wavimedia.com

Wavi Medias hjemmeside. Astro, hostet på Vercel. Alle sider er statiske; kun `/api/contact` (kontaktformular), `/api/scan` og `/api/speed` (store scan) kører som Vercel Functions. Ingen tracking-cookies, ingen eksterne fonte (selvhostet via Fontsource).

## Kom i gang

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bygger til .vercel/output
```

Vercel bygger automatisk ved hvert push til `main`.

## Kontaktformular

Formularen på `/contact` poster til `src/pages/api/contact.ts`, som sender en mail via Resend og (valgfrit) en besked til Slack. Leadets mail sættes som Reply-To, så man svarer direkte fra indbakken. Et skjult felt fanger spam-bots.

Sæt under Vercel → Project → Settings → Environment Variables (Production + Preview), og redeploy bagefter:

| Variabel | Krævet | Beskrivelse |
|---|---|---|
| `RESEND_API_KEY` | ja (for mail) | API-nøgle fra resend.com |
| `CONTACT_TO` | nej | Modtager(e), kommasepareret. Standard: `hello@wavimedia.com` |
| `CONTACT_FROM` | nej | Afsender. Standard: `Wavi website <onboarding@resend.dev>` |
| `SLACK_WEBHOOK_URL` | nej | Sættes den, sendes hvert lead også til Slack. Ingen kodeændring. |

Uden verificeret domæne i Resend leverer `onboarding@resend.dev` kun til den mail, Resend-kontoen er oprettet med. Når wavimedia.com er verificeret i Resend (DNS-records hos domæneudbyderen), sættes `CONTACT_FROM` til fx `Wavi website <website@wavimedia.com>`.

Er ingen nøgle sat, viser formularen en fejl med hello@wavimedia.com som alternativ i stedet for at lade som om, den har sendt.

## Store scan

`/tools/store-scan` kalder først `src/pages/api/scan.ts`, som henter butikkens forside og læser de Google Tag Manager-containere den indlæser (få sekunder). Rapporten vises med det samme, og `src/pages/api/speed.ts` måler derefter mobilhastighed via Google PageSpeed Insights (op til ca. et minut på tunge butikker). Analysen ligger i `src/lib/scan.ts` og rapporterer kun det, der kan ses udefra: Meta Pixel, Google-tags (GA4, Ads, GTM), consent-banner og Consent Mode, Klaviyo, TikTok og mobil-LCP. Conversions API kan ikke ses udefra, og rapporten siger det i stedet for at gætte.

Sikkerhed: kun offentlige http(s)-adresser kan scannes (private IP'er og interne navne afvises ved hvert redirect), med timeout og størrelsesgrænse. Intet gemmes.

| Variabel | Krævet | Beskrivelse |
|---|---|---|
| `PAGESPEED_API_KEY` | anbefalet | Gratis nøgle fra Google Cloud (PageSpeed Insights API). Uden den bruges Googles delte kvote, som kan løbe tør; så viser rapporten "Not measured" i stedet for et tal. |

## Struktur

```
src/
  data/          # alt indhold - ret her, ikke i siderne
    site.ts      # nøgletal, kunder, partnere, udtalelser
    services.ts  # 3 tracks + 9 ydelser (tekster, "leaks", "how we run it")
    cases.ts     # cases + data til covers (kun offentliggjorte tal)
  components/    # Nav, Footer, Graphic (11 diagrammer), Cover, værktøjer
  lib/scan.ts    # store scan-analyse (rene funktioner, testbare)
  lib/fetch.ts   # sikker hentning: kun offentlige adresser, tjek ved hvert redirect
  layouts/Base.astro
  pages/
    index.astro
    api/contact.ts          # kontaktformularens endpoint (Vercel Function)
    api/scan.ts             # store scan: tracking-tjek (Vercel Function)
    api/speed.ts            # store scan: mobilhastighed via PageSpeed (Vercel Function)
    services/[slug].astro   # track-sider OG ydelses-sider fra services.ts
    work/index.astro, work/[slug].astro
    framework.astro, studio.astro, contact.astro, privacy.astro, 404.astro
    tools/profit-check.astro, store-scan.astro, growth-score.astro
  styles/global.css         # design tokens fra brandbogen
```

**Ny case:** tilføj et objekt i `src/data/cases.ts`. Siden, Work-griddet og "next case" opdateres selv.
**Ny ydelse:** tilføj i `src/data/services.ts` og vælg et `graphic`.

## Brandregler i koden

- Farver: Ink `#141414`, Coral `#F0421E`, Sand `#EFE9DC`, Off-white `#FAF8F4`.
- Fonte: Newsreader (display), Schibsted Grotesk (brødtekst), IBM Plex Mono (labels).
- Én coral-accent pr. flade. Coral bruges aldrig som baggrundsflade.
- Diagrammer er mærket "Illustrative" og viser aldrig kundetal. Covers viser kun offentliggjorte tal.

## Før lancering (TODO)

- [x] Kontaktformular sender mail (Resend) - mangler kun `RESEND_API_KEY` i Vercel.
- [ ] Slack: sæt `SLACK_WEBHOOK_URL`, når kanalen er klar.
- [x] Store scan live (`/api/scan`). Sæt `PAGESPEED_API_KEY` for stabil hastighedsmåling.
- [ ] Bekræft "average partnership": 2+ eller 3+ år (`src/data/site.ts`).
- [ ] Fotos fra Cyprus-optagelsen: founder, team (erstat monogram-tiles i `studio.astro`).
- [ ] Kundelogoer som SVG.
- [ ] Endelig privatlivspolitik (`src/pages/privacy.astro`) og sociale links (`Footer.astro`).
- [ ] Commit `package-lock.json` efter første `npm install`.
- [ ] Analytics/pixel: tilføjes med consent - opdatér cookie-teksten samtidig.
- [ ] Sidste skridt: tilføj domænet wavimedia.com i Vercel.
