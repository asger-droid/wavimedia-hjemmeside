import type { QuoteKey } from './site';

export type GraphicKind = 'structure' | 'search' | 'creative' | 'flow' | 'automation' | 'cro' | 'systems' | 'analytics' | 'finance' | 'dashboard' | 'framework';
export type TrackId = 'acquisition' | 'retention' | 'advisory';
type Pair = [string, string];

export interface Service {
  slug: string; track: TrackId; num: string; name: string; platforms: string; graphic: GraphicKind;
  summary: string; bullets: string[];
  h1a: string; h1b: string; sub: string;
  leaks: Pair[]; howA: string; howB: string; how: Pair[];
  proof: { meta: true } | { quote: QuoteKey };
  related: string[];
}

export interface Track {
  id: TrackId; num: string; name: string; line: string; intro: string; graphic: GraphicKind;
  h1a: string; h1b: string; sub: string;
  statementA: string; statementB: string; statementC?: string; statementBody?: string;
  reportA: string; reportB: string; report: Pair[];
  proofCases: string[]; quote?: QuoteKey;
  faq?: Pair[];
}

export const tracks: Track[] = [
  { id: 'acquisition', num: '01', name: 'Acquisition', graphic: 'structure',
    line: 'New customers at a cost that respects the P&L.',
    intro: 'Paid social, paid search and creative, bid to profit per order rather than to a ROAS target that only looks good in a dashboard.',
    h1a: 'New customers at a cost that respects the', h1b: 'P&L.',
    sub: 'Paid social, paid search and creative, run by senior people and bid to profit, not to a ROAS target that looks good in a dashboard.',
    statementA: 'Most acquisition is optimised for the wrong number. Revenue goes up, ROAS looks fine, and the business keeps', statementB: 'less.',
    statementBody: 'We start from your margins, returns and fulfilment costs, then build accounts that bid to what each order actually leaves behind. Spend scales only once the maths holds.',
    reportA: 'We report on what the business', reportB: 'keeps.',
    report: [['Contribution margin', 'After product, shipping, returns and ad spend.'], ['Profit per order', 'What each conversion actually leaves behind.'], ['New-customer cost', 'Separated from returning buyers you already paid for.'], ['Payback period', 'How long until a new customer has paid for themselves.']],
    proofCases: ['herskind', 'mp-denmark', 'fashion-by-strand'],
    faq: [['Which platforms do you run?', 'Meta, Google and TikTok, with Klaviyo on the retention side. We pick channels from your margins, not from habit.'], ['Who actually works on my account?', 'The people who win the work do the work. No juniors hidden behind a senior pitch.']] },
  { id: 'retention', num: '02', name: 'Retention', graphic: 'flow',
    line: 'Compound LTV, so you never pay for the same customer twice.',
    intro: 'Lifecycle email, automation and conversion work that makes the second and third order the default.',
    h1a: 'Never pay for the same customer', h1b: 'twice.',
    sub: 'Lifecycle email, automation and conversion work that turns a first order into a habit, so acquisition gets cheaper every month you run it.',
    statementA: 'Most brands treat email as a broadcast channel and discounts as a retention strategy. Both quietly', statementB: 'eat margin.',
    statementBody: 'Your acquisition cost will never hit zero. What a customer is worth after the first order can always grow. Retention is measured in contribution margin, not open rates.',
    reportA: 'Not open rates.', reportB: 'Second orders.',
    report: [['Repeat purchase rate', 'Share of customers who come back, by cohort.'], ['Customer value over time', 'Contribution per customer at 90, 180 and 365 days.'], ['Returning revenue share', 'How much of the month did not need paid media.'], ['Discount dependency', 'Orders that only happened because of a code.']],
    proofCases: ['lulu-copenhagen', 'gobabygo'], quote: 'lulu' },
  { id: 'advisory', num: '03', name: 'Advisory', graphic: 'dashboard',
    line: 'Senior counsel, from ad account to boardroom.',
    intro: 'The structure around the marketing: processes, measurement and the financial view that ties spend to the P&L.',
    h1a: 'Senior counsel, from ad account to', h1b: 'boardroom.',
    sub: 'The structure around your marketing: the processes, the measurement and the financial view that ties every euro of spend to the P&L.',
    statementA: 'Most growth decisions are made on platform numbers nobody fully trusts, by the one person who knows how it all connects. That is a', statementB: 'risk,', statementC: 'not a process.',
    reportA: 'One page. Every number', reportB: 'earns its place.',
    report: [['Net revenue', '€ [ ]'], ['Product, shipping & returns', '- € [ ]'], ['Marketing spend', '- € [ ]'], ['Contribution after marketing', '€ [ ]'], ['New customers · cost each', '[ ] · € [ ]'], ['Payback period', '[ ] days']],
    proofCases: ['fashion-by-strand', 'plusled'], quote: 'uncommon' }
];

const L = (a: Pair[]) => a;
export const services: Service[] = [
  { slug: 'paid-social', track: 'acquisition', num: '1.1', name: 'Paid Social', platforms: 'Meta · TikTok', graphic: 'structure', proof: { meta: true },
    summary: 'Account structures built around contribution margin, a steady creative testing rhythm, and bidding that follows profit per order rather than platform-reported ROAS.',
    bullets: ['Margin-aware campaign architecture', 'Creative testing cadence and learnings log', 'New vs returning customer split'],
    h1a: 'Ads that make money on the P&L, not just in', h1b: 'Ads Manager.',
    sub: 'Meta and TikTok, run by senior people and bid to the profit each order leaves behind.',
    leaks: L([['Bidding to revenue', 'A €40 order at 70% margin and a €40 order at 20% margin get the same bid.'], ['Paying for loyal customers', 'Returning buyers counted as new, so the real cost of a new customer stays hidden.'], ['Creative by gut', 'Ads launched without a hypothesis, so a win teaches nothing you can repeat.'], ['Too fragmented to learn', 'Many small ad sets, none with enough data for the algorithm to do its job.']]),
    howA: 'Margin in.', howB: 'Profit out.',
    how: L([['Your margins go into the account', 'Product-level contribution data feeds the bidding, so spend flows to what actually makes money.'], ['New and returning, split', 'You see what a new customer really costs, and stop paying full price for people who would have come back anyway.'], ['Creative tested on purpose', 'Every test has a hypothesis and a log, so wins compound into a library of what sells.'], ['Consolidated structure', 'Fewer, stronger campaigns with enough signal to learn, and clear rules for when to scale.']]),
    related: ['paid-search', 'creative-strategy', 'email-crm'] },
  { slug: 'paid-search', track: 'acquisition', num: '1.2', name: 'Paid Search', platforms: 'Google · Shopping · PMax', graphic: 'search', proof: { quote: 'lulu' },
    summary: 'Search and Shopping that captures demand without paying twice for it. Clean feeds, brand and non-brand kept apart, and margin data fed back into bidding.',
    bullets: ['Product feed structure and labels', 'Brand vs non-brand separation', 'Profit-based bidding signals'],
    h1a: 'Capture demand without paying for it', h1b: 'twice.',
    sub: 'Search, Shopping and Performance Max with clean feeds, brand kept apart, and margin fed back into every bid.',
    leaks: L([['Brand traffic dressed as growth', 'Automated campaigns spend on people already searching for your name.'], ['Feeds built for compliance', 'Titles and labels that tell Google nothing about what sells or what it earns.'], ['Every product bid the same', 'Bestsellers and loss leaders treated as equals.'], ['Search terms nobody reads', 'Budget quietly leaking into queries that never convert.']]),
    howA: 'Clean feed.', howB: 'Clear profit.',
    how: L([['Brand and non-brand apart', 'So you can see what search genuinely adds, and what it only takes credit for.'], ['A feed that sells', 'Titles, images and custom labels written for buyers and for bidding.'], ['Margin-based bidding', 'Product-level profit signals, so high-margin products get the push.'], ['Weekly query hygiene', 'Negatives, structure and placements kept tight, every week.']]),
    related: ['paid-social', 'analytics-attribution', 'conversion-cro'] },
  { slug: 'creative-strategy', track: 'acquisition', num: '1.3', name: 'Creative Strategy', platforms: 'Angles · Briefs · Testing', graphic: 'creative', proof: { quote: 'uncommon' },
    summary: 'The ads are the targeting now. We find the angles that sell, brief them properly, and test them in a structure that tells you why something worked.',
    bullets: ['Angle and hook research', 'Briefs for in-house teams or partners', 'Structured test plans'],
    h1a: 'The ads are the targeting now. Make them', h1b: 'worth it.',
    sub: 'We find the angles that sell, brief them properly and test them in a structure that tells you why something worked.',
    leaks: L([['Production before strategy', 'Content shot before anyone knows which angle it should prove.'], ['Testing by volume', 'More ads, no hypothesis, no learning.'], ['Winners nobody understands', 'The best ad works and no one knows why, so it cannot be repeated.'], ['Brand versus performance', 'Ads that convert this week and cheapen the brand for years.']]),
    howA: 'Angles first.', howB: 'Assets second.',
    how: L([['Angle research', 'Reviews, support tickets and competitors mined for what buyers actually care about.'], ['Briefs that travel', 'Clear enough for your team, creators or production partners to deliver first time.'], ['A test matrix', 'Hooks against formats, one variable at a time.'], ['A learnings library', 'Every result logged, so wins compound instead of being forgotten.']]),
    related: ['paid-social', 'paid-search', 'conversion-cro'] },
  { slug: 'email-crm', track: 'retention', num: '2.1', name: 'Email, flows & CRM', platforms: 'Klaviyo', graphic: 'flow', proof: { quote: 'lulu' },
    summary: 'Welcome, abandonment, post-purchase, replenishment and winback flows, built around margin and purchase timing.',
    bullets: ['Flow architecture and naming', 'Segments on real behaviour', 'Deliverability and list health'],
    h1a: 'Email that sells the second order, not just the', h1b: 'next sale.',
    sub: 'Klaviyo flows, segments and campaigns built on purchase behaviour, measured in margin rather than open rates.',
    leaks: L([['Campaigns, no flows', 'Revenue depends on the next send instead of a system that runs itself.'], ['Discount as default', 'Every email teaches customers to wait for a code.'], ['One list for everyone', 'First-time buyers and loyal fans get the same message.'], ['Deliverability ignored', 'Quietly landing in promotions or spam, and nobody notices.']]),
    howA: 'Behaviour in.', howB: 'Orders out.',
    how: L([['Flow architecture', 'Welcome, browse, cart, post-purchase, replenishment and winback, built as one system.'], ['Behavioural segments', 'Built on what people bought and when, not on who signed up when.'], ['Margin-safe offers', 'Incentives that move orders without giving away contribution.'], ['List health', 'Authentication, engagement tiers and sunsetting, so you stay in the inbox.']]),
    related: ['automation', 'conversion-cro', 'paid-social'] },
  { slug: 'automation', track: 'retention', num: '2.2', name: 'Automation', platforms: 'Systems', graphic: 'automation', proof: { quote: 'gobabygo' },
    summary: 'The connective tissue between store, CRM and ads, so customer data moves without someone copying it by hand.',
    bullets: ['Store, CRM and ad audience sync', 'Triggered offers and suppression', 'Fewer manual steps, fewer errors'],
    h1a: 'Customer data that moves', h1b: 'on its own.',
    sub: 'The connective tissue between store, CRM, ads and reporting, so nobody exports a CSV on a Friday afternoon.',
    leaks: L([['Manual exports', 'Audiences updated whenever someone remembers.'], ['Ads chasing existing customers', 'Suppression lists out of date, so you pay to reach people you already have.'], ['Data in five places', 'Five versions of the truth, none of them complete.'], ['Fragile automations', 'Nobody owns them until they break.']]),
    howA: 'Set up once.', howB: 'Runs every day.',
    how: L([['One customer profile', 'Store, email and ad data joined around the same person.'], ['Audience sync', 'Ads and email always see the same segments.'], ['Triggered actions', 'Offers, suppressions and alerts fired by behaviour, not by a calendar.'], ['Owned and documented', 'Every automation has an owner and a note explaining it.']]),
    related: ['email-crm', 'analytics-attribution', 'systems-processes'] },
  { slug: 'conversion-cro', track: 'retention', num: '2.3', name: 'Conversion & CRO', platforms: 'On-site', graphic: 'cro', proof: { quote: 'lulu' },
    summary: 'Every point of conversion rate makes every euro of ad spend cheaper. We test what moves orders, not what moves clicks.',
    bullets: ['Funnel and checkout analysis', 'Structured A/B testing', 'Offer and bundle strategy'],
    h1a: 'Every point of conversion makes every euro of ads', h1b: 'cheaper.',
    sub: 'Funnel analysis and structured testing on the steps that actually lose orders.',
    leaks: L([['Testing opinions', 'Button colours debated while the checkout loses orders.'], ['Checkout friction', 'Surprise costs and forced accounts at the very last step.'], ['Slow pages', 'Every extra second of load time is a tax on ad spend.'], ['No baseline', 'Tests run without knowing what normal looks like.']]),
    howA: 'Find the leak.', howB: 'Fix it first.',
    how: L([['Funnel diagnosis', 'Step by step, device by device, to see where orders are lost.'], ['Prioritised by impact', 'The steepest drop gets fixed first.'], ['Structured A/B tests', 'Proper samples, one change at a time, decisions written down.'], ['Offer and bundle strategy', 'Order value up without training customers to wait for discounts.']]),
    related: ['email-crm', 'paid-social', 'analytics-attribution'] },
  { slug: 'systems-processes', track: 'advisory', num: '3.1', name: 'Systems & processes', platforms: 'Operations', graphic: 'systems', proof: { quote: 'uncommon' },
    summary: 'Growth that does not depend on one person’s head. Documented playbooks, clear ownership and a reporting rhythm the whole team runs on.',
    bullets: ['Playbooks and ownership maps', 'Weekly and monthly reporting rhythm', 'In-house team enablement'],
    h1a: 'Growth that does not depend on one person’s', h1b: 'head.',
    sub: 'Playbooks, clear ownership and a reporting rhythm your whole team can run.',
    leaks: L([['Key-person risk', 'One person leaves and the knowledge goes with them.'], ['Meetings without decisions', 'Status updates instead of choices.'], ['Agency and team pulling apart', 'Nobody is sure who owns what.'], ['Reporting as homework', 'Hours building slides nobody reads.']]),
    howA: 'Written down.', howB: 'Run every week.',
    how: L([['Ownership map', 'Who decides, who does, who needs to know, for every part of growth.'], ['Playbooks', 'The way things are done, written so anyone can pick them up.'], ['A weekly rhythm', 'The same review, test and report cycle, every week.'], ['Team enablement', 'Your people trained to run it, with or without us.']]),
    related: ['analytics-attribution', 'financial-advisory', 'automation'] },
  { slug: 'analytics-attribution', track: 'advisory', num: '3.2', name: 'Analytics & attribution', platforms: 'Measurement', graphic: 'analytics', proof: { quote: 'uncommon' },
    summary: 'One source of truth. Tracking and consent set up properly, then a view of performance that does not depend on which platform is grading its own homework.',
    bullets: ['Tracking and consent setup', 'Blended, profit-based reporting', 'Live client dashboards'],
    h1a: 'One source of truth. Not three platforms grading their own', h1b: 'homework.',
    sub: 'Tracking, consent and reporting set up so the numbers agree with your store and your bank account.',
    leaks: L([['Double counting', 'Meta and Google each take credit for the same order.'], ['Half-built tracking', 'Pixels, consent and server-side events only partly in place.'], ['Revenue without margin', 'Reports that stop at the top line.'], ['Last click for everything', 'Work higher in the funnel looks worthless.']]),
    howA: 'Measure once.', howB: 'Trust it.',
    how: L([['Tracking and consent audit', 'What fires, what is missing and what is legally shaky.'], ['Server-side events', 'Signals that survive browsers and consent banners.'], ['Blended reporting', 'Orders in your store against total spend, not platform claims.'], ['Live dashboards', 'The same numbers for you, your board and us.']]),
    related: ['financial-advisory', 'paid-search', 'automation'] },
  { slug: 'financial-advisory', track: 'advisory', num: '3.3', name: 'Financial advisory', platforms: 'P&L', graphic: 'finance', proof: { meta: true },
    summary: 'The finance view most agencies never touch. Contribution margin by product, spend planning and scenarios a board can actually decide on.',
    bullets: ['Contribution margin model', 'Budget and scenario planning', 'Board-ready growth reporting'],
    h1a: 'The finance view most agencies never', h1b: 'touch.',
    sub: 'Contribution margin by product, spend planning and scenarios a board can actually decide on.',
    leaks: L([['Budgets as a share of revenue', 'Spend that ignores what each product earns.'], ['No contribution view', 'Nobody knows which products pay for growth.'], ['Cash surprises', 'Growth that quietly eats working capital.'], ['Board packs built on ROAS', 'Big decisions made on the wrong number.']]),
    howA: 'P&L first.', howB: 'Media second.',
    how: L([['Contribution margin model', 'By product and channel, updated as costs change.'], ['Spend planning', 'Budgets built from unit economics, not last year plus ten percent.'], ['Scenario planning', 'What happens at more spend, a price change or a new market.'], ['Board-ready reporting', 'One page, in the language of the P&L.']]),
    related: ['analytics-attribution', 'systems-processes', 'paid-social'] }
];

export const trackById = (id: TrackId) => tracks.find((t) => t.id === id)!;
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const servicesFor = (id: TrackId) => services.filter((s) => s.track === id);
export const serviceHref = (slug: string) => `/services/${slug}`;
export const trackHref = (id: TrackId) => `/services/${id}`;
