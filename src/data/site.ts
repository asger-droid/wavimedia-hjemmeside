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
  clients: ['Herskind', 'LULU Copenhagen', 'MP Denmark', 'Build-A-Bear', 'Fashion By Strand', 'Uncommon', 'GoBabyGo', 'Blox Fruits'],
  partners: ['Meta Business Partner', 'Google Partner', 'TikTok Marketing Partner', 'Klaviyo Partner', 'Shopify Partner', 'ProfitMetrics Partner'],
  metaCase: 'https://www.facebook.com/business/success/fashionbystrand'
};

export const testimonials = {
  uncommon: { text: 'A partner who does exactly what a partner should, giving the best advice even when it isn’t what you want to hear.', name: 'Brian Schøler', role: 'Partner · Uncommon' },
  lulu: { text: 'Extremely professional approach and great expertise. We have always been very pleased with the close collaboration with Wavi Media and Asger.', name: 'Rasmus Gottliebsen', role: 'Co-founder · LULU Copenhagen' },
  gobabygo: { text: 'We have collaborated with Wavi Media for a long time and have always been very pleased. They are always very hands-on and solution-oriented.', name: 'Fie Aspöck Jonsen', role: 'Founder · GoBabyGo' }
} as const;

export type QuoteKey = keyof typeof testimonials;
