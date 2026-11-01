import caseMedia from './case-media.json';

// Which imported images each case shows, in order (1-based, see src/data/case-media.json).
// Curated by hand: screenshots, text cards and images too small to look sharp are left out.
// With a video, the first pick is the video's poster image. A case not listed here shows its first images automatically.
export const galleryPick: Record<string, number[]> = {
  'build-a-bear': [1, 2, 4],
  'lulu-copenhagen': [1, 2, 5],
  'blox-fruits': [2, 4],
  'mp-denmark': [2, 3, 4],
  'drommeland': [1, 2],
  'drink-mashup': [1, 2, 3],
  'dbu': [3],
  'sos-international': [1],
  'hjernesagen': [1],
  'stryhns': [1, 2, 4],
  'plusled': [1, 3, 4],
  'gobabygo': [5, 3, 4]
};

// Cover photo per case (1-based image number), used on the Work cards, the case page top and "Next case".
// pos sets which part of the photo stays in frame when it is cropped. Cases not listed keep their data portrait
// (DBU has no photo that works as a cover, Blox Fruits' logo art doesn't survive the crop; Herskind and Fashion By Strand have no images).
export const coverPick: Record<string, { n: number; pos?: string }> = {
  'lulu-copenhagen': { n: 2, pos: 'center 55%' },
  'mp-denmark': { n: 4, pos: 'center 60%' },
  'plusled': { n: 4, pos: 'center 55%' },
  'gobabygo': { n: 3, pos: 'center 55%' },
  'build-a-bear': { n: 3, pos: 'center 60%' },
  'stryhns': { n: 2, pos: 'center 55%' },
  'sos-international': { n: 1, pos: '15% 45%' },
  'drink-mashup': { n: 1, pos: 'center 50%' },
  'drommeland': { n: 1, pos: 'center 40%' },
  'hjernesagen': { n: 1, pos: 'center 50%' }
};

type Media = { images?: { src: string; w: number; h: number; alt: string }[] };
export const coverPhoto = (slug: string) => {
  const pick = coverPick[slug];
  const img = pick && (caseMedia as Record<string, Media>)[slug]?.images?.[pick.n - 1];
  return img ? { ...img, pos: pick.pos ?? 'center' } : undefined;
};
