import { BACKGROUND_IMAGES } from "./backgrounds.generated";
import { ONLINE_BACKGROUND_IMAGES } from "./backgrounds.online.generated";

// Curated online photos (clean maritime/logistics shots) lead the rotation,
// followed by the bundled local images.
export const ALL_BACKGROUNDS: string[] = [...ONLINE_BACKGROUND_IMAGES, ...BACKGROUND_IMAGES];

// Rotate every two weeks (like a desktop wallpaper slideshow). A fixed epoch
// keeps the schedule stable and identical for every visitor/server.
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const EPOCH_MS = Date.UTC(2024, 0, 1); // Mon 1 Jan 2024, 00:00 UTC — arbitrary anchor

/** Index of the current 2-week window since the epoch (advances every 14 days). */
export function biweeklyPeriodIndex(date = new Date()): number {
  return Math.floor((date.getTime() - EPOCH_MS) / TWO_WEEKS_MS);
}

/**
 * Pick the background image for the current fortnight. Cycles through all
 * available images (local + online), changing every two weeks and wrapping
 * around. Returns null if there are no images, in which case no background is
 * shown.
 */
export function backgroundForNow(date = new Date()): string | null {
  if (!ALL_BACKGROUNDS.length) return null;
  const idx = biweeklyPeriodIndex(date);
  return ALL_BACKGROUNDS[((idx % ALL_BACKGROUNDS.length) + ALL_BACKGROUNDS.length) % ALL_BACKGROUNDS.length];
}

export { BACKGROUND_IMAGES };
