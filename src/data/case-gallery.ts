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
