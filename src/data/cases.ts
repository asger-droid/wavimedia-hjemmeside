import { site } from './site';

export type Motif = 'bars' | 'dots' | 'arrow' | 'mark' | 'none';
export type Tone = 'ink' | 'sand' | 'slate' | 'paper';

export interface CoverData {
  motif: Motif; tone: Tone; letter: string;
  v1?: number; v2?: number; v1Label?: string; v2Label?: string; l1?: string; l2?: string; n?: number;
}

export interface Case {
  slug: string; brand: string; sector: string; metric: string; label: string;
  statement: string; context: string; resultShort: string;
  cover: CoverData;
  quote?: { text: string; by: string };
  link?: { href: string; label: string };
}

// Only real, published numbers. Full stories are offered on a call until each client approves a write-up.
export const cases: Case[] = [
  { slug: 'herskind', brand: 'Herskind', sector: 'Fashion', metric: '+200%', label: 'Revenue in 12 months',
    statement: 'Revenue tripled in twelve months.', resultShort: '+200% revenue',
    context: 'Revenue indexed to the month the partnership started: 100 became 300 within a year.',
    cover: { motif: 'bars', tone: 'sand', letter: 'H', v1: 100, v2: 300, v1Label: '100', v2Label: '300', l1: 'Start', l2: 'Month 12' } },
  { slug: 'fashion-by-strand', brand: 'Fashion By Strand', sector: 'Fashion', metric: 'Meta', label: 'Official Meta success story',
    statement: 'Scaled profitably, without losing the brand.', resultShort: 'Published by Meta',
    context: 'We rebuilt acquisition around contribution margin to raise profit per conversion. Meta published the result as one of its own success stories.',
    cover: { motif: 'arrow', tone: 'ink', letter: 'S', l2: 'Profit per conversion' },
    quote: { text: 'The increases in profit per conversion and profit after ad spend speak for themselves.', by: 'Meta · Fashion By Strand case story' },
    link: { href: site.metaCase, label: 'Read the full story on Meta ↗' } },
  { slug: 'mp-denmark', brand: 'MP Denmark', sector: 'Fashion', metric: '+192%', label: 'Increase in ROAS',
    statement: 'Almost three times the return on every euro of ad spend.', resultShort: '+192% ROAS',
    context: 'Return on ad spend, indexed: 100 before the work, 292 after.',
    cover: { motif: 'bars', tone: 'slate', letter: 'M', v1: 100, v2: 292, v1Label: '100', v2Label: '292', l1: 'Before', l2: 'After' } },
  { slug: 'lulu-copenhagen', brand: 'LULU Copenhagen', sector: 'Jewelry', metric: '+11', label: 'New markets scaled into',
    statement: 'Eleven new markets, scaled on one system.', resultShort: '+11 markets',
    context: 'Each dot on the cover is a market LULU Copenhagen scaled into with us.',
    cover: { motif: 'dots', tone: 'paper', letter: 'L', n: 11, l2: '11 new markets' },
    quote: { text: 'Extremely professional approach and great expertise. We have always been very pleased with the close collaboration with Wavi Media and Asger.', by: 'Rasmus Gottliebsen · Co-founder, LULU Copenhagen' } },
  { slug: 'build-a-bear', brand: 'Build-A-Bear', sector: 'Retail', metric: '+3', label: 'Markets scaled into',
    statement: 'Three new markets for a global retail brand.', resultShort: '+3 markets',
    context: 'Each dot on the cover is a market Build-A-Bear scaled into with us.',
    cover: { motif: 'dots', tone: 'ink', letter: 'B', n: 3, l2: '3 markets' } },
  { slug: 'blox-fruits', brand: 'Blox Fruits', sector: 'Gaming', metric: '-15%', label: 'Lower traffic cost',
    statement: 'Traffic cost down fifteen percent.', resultShort: '-15% traffic cost',
    context: 'Traffic cost, indexed: 100 before the work, 85 after.',
    cover: { motif: 'bars', tone: 'sand', letter: 'X', v1: 100, v2: 85, v1Label: '100', v2Label: '85', l1: 'Before', l2: 'After' } }
];

export const sectors = ['All', ...Array.from(new Set(cases.map((c) => c.sector)))];
export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
export const nextCase = (slug: string) => cases[(cases.findIndex((c) => c.slug === slug) + 1) % cases.length];
