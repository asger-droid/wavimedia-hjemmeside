# wavimedia.com

Wavi Medias hjemmeside. Astro, hostet på Vercel. Alle sider er statiske; kun kontaktformularens endpoint (`/api/contact`) kører som Vercel Function. Ingen tracking-cookies, ingen eksterne fonte (selvhostet via Fontsource).

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
    api/contact.ts          # kontaktformularens endpoint (Vercel Function)
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
- [ ] Store scan: erstat `EXAMPLE` med kald til scanner-API'et på Vercel (`src/pages/tools/store-scan.astro`).
- [ ] Bekræft "average partnership": 2+ eller 3+ år (`src/data/site.ts`).
- [ ] Fotos fra Cyprus-optagelsen: founder, team (erstat monogram-tiles i `studio.astro`).
- [ ] Kundelogoer som SVG.
- [ ] Endelig privatlivspolitik (`src/pages/privacy.astro`) og sociale links (`Footer.astro`).
- [ ] Commit `package-lock.json` efter første `npm install`.
- [ ] Analytics/pixel: tilføjes med consent - opdatér cookie-teksten samtidig.
- [ ] Sidste skridt: tilføj domænet wavimedia.com i Vercel.
