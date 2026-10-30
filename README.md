# wavimedia.com

Wavi Medias hjemmeside. Astro (statisk), hostet på Vercel. Ingen tracking-cookies, ingen eksterne fonte (selvhostet via Fontsource).

## Kom i gang

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bygger til dist/
```

Vercel: importér repoet, framework "Astro". Ingen environment variables nødvendige endnu. `vercel.json` slår clean URLs til (`/work/herskind` i stedet for `.html`).

## Struktur

```
src/
  data/          # alt indhold - ret her, ikke i siderne
    site.ts      # nøgletal, kunder, partnere, udtalelser
    services.ts  # 3 tracks + 9 ydelser (tekster, "leaks", "how we run it")
    cases.ts     # cases + data til covers (kun offentliggjorte tal)
  components/    # Nav, Footer, Graphic (11 diagrammer), Cover, værktøjer
  layouts/Base.astro
  pages/
    index.astro
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

- [ ] Kontaktformular: kobl til CRM/Klaviyo (`src/pages/contact.astro`). Lige nu sendes intet.
- [ ] Store scan: erstat `EXAMPLE` med kald til scanner-API'et på Vercel (`src/pages/tools/store-scan.astro`).
- [ ] Bekræft "average partnership": 2+ eller 3+ år (`src/data/site.ts`).
- [ ] Fotos fra Cyprus-optagelsen: founder, team (erstat monogram-tiles i `studio.astro`).
- [ ] Kundelogoer som SVG.
- [ ] Endelig privatlivspolitik (`src/pages/privacy.astro`) og sociale links (`Footer.astro`).
- [ ] Commit `package-lock.json` efter første `npm install`.
- [ ] Analytics/pixel: tilføjes med consent - opdatér cookie-teksten samtidig.
