import { BACKGROUND_IMAGES } from "./backgrounds.generated";

/**
 * Pick the background image for the current month. Cycles through the folder
 * each month (month index modulo the number of images). Returns null if the
 * folder is empty, in which case no background is shown.
 */
export function backgroundForNow(date = new Date()): string | null {
  if (!BACKGROUND_IMAGES.length) return null;
  // Months since a fixed epoch so it advances every calendar month, then wraps.
  const monthIndex = date.getFullYear() * 12 + date.getMonth();
  return BACKGROUND_IMAGES[monthIndex % BACKGROUND_IMAGES.length];
}

export { BACKGROUND_IMAGES };
