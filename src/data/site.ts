export const site = {
  name: 'Wavi Media',
  email: 'hello@wavimedia.com',
  studio: 'Copenhagen · Nordics',
  // "Average partnership": 3+ yrs, as on the Framer site and the live About page.
  stats: [
    { value: '276+', label: 'Founders partnered with' },
    { value: '98%', label: 'Client satisfaction' },
    { value: '3+ yrs', label: 'Average partnership' },
    { value: '24+', label: 'Markets served' }
  ],
  // Client logos in their original colours (public/logos): white backgrounds removed, brand-coloured backgrounds kept as a badge, sized to equal visual weight.
  logos: [
    { name: 'Herskind', src: '/logos/herskind.webp', w: 210, h: 26 },
    { name: 'LULU Copenhagen', src: '/logos/lulu-copenhagen.webp', w: 128, h: 54 },
    { name: 'MP Denmark', src: '/logos/mp-denmark.webp', w: 57, h: 56 },
    { name: 'Build-A-Bear', src: '/logos/build-a-bear.webp', w: 56, h: 56 },
    { name: 'GoBabyGo', src: '/logos/gobabygo.webp', w: 167, h: 41 },
    { name: 'DBU', src: '/logos/dbu.webp', w: 56, h: 56 },
    { name: 'SOS International', src: '/logos/sos-international.webp', w: 163, h: 42 },
    { name: 'GF Forsikring', src: '/logos/gf-forsikring.webp', w: 81, h: 56 },
    { name: 'Drømmeland', src: '/logos/drommeland.webp', w: 166, h: 42 },
    { name: 'Karmamia Copenhagen', src: '/logos/karmamia.webp', w: 109, h: 56 },
    { name: 'Unfold Copenhagen', src: '/logos/unfold.webp', w: 142, h: 49 },
    { name: 'Børneloppen', src: '/logos/borneloppen.webp', w: 115, h: 56 },
    { name: 'Stryhns Gruppen', src: '/logos/stryhns.webp', w: 83, h: 56 },
    { name: 'Mashup', src: '/logos/mashup.webp', w: 56, h: 56 },
    { name: 'PlusLED', src: '/logos/plusled.webp', w: 187, h: 37 },
    { name: 'ProfitMetrics', src: '/logos/profitmetrics.webp', w: 156, h: 44 }
  ],
  partners: ['Meta Business Partner', 'Google Partner', 'TikTok Marketing Partner', 'Klaviyo Partner', 'Shopify Partner', 'ProfitMetrics Partner'],
  metaCase: 'https://www.facebook.com/business/success/fashionbystrand'
};

export const testimonials = {
  uncommon: { text: 'A partner who does exactly what a partner should, giving the best advice even when it isn’t what you want to hear.', name: 'Brian Schøler', role: 'Partner · Uncommon' },
  lulu: { text: 'Extremely professional approach and great expertise. We have always been very pleased with the close collaboration with Wavi Media and Asger.', name: 'Rasmus Gottliebsen', role: 'Co-founder · LULU Copenhagen' },
  gobabygo: { text: 'We have collaborated with Wavi Media for a long time and have always been very pleased. They are always very hands-on and solution-oriented.', name: 'Fie Aspöck Jonsen', role: 'Founder · GoBabyGo' }
} as const;

export type QuoteKey = keyof typeof testimonials;
