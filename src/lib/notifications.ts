import { prisma } from "@/lib/prisma";
import type { AppNotification } from "@/components/layout/NotificationBell";

const DAY = 86400000;

const DOC_LABELS_EN: Record<string, string> = {
  DRIVER_LICENSE: "Driver License",
  INSURANCE: "Insurance",
  TECHNICAL_INSPECTION: "Technical inspection",
  CARTE_GRISE: "Carte grise",
  VIGNETTE: "Vignette",
};
const DOC_LABELS_FR: Record<string, string> = {
  DRIVER_LICENSE: "Permis de conduire",
  INSURANCE: "Assurance",
  TECHNICAL_INSPECTION: "Visite technique",
  CARTE_GRISE: "Carte grise",
  VIGNETTE: "Vignette",
};

/**
 * Build the notification list shown in the top-bar bell. Currently surfaces
 * fleet documents expiring within 30 days (or already expired), most urgent
 * first — the same data the Fleet page shows as an inline alert banner.
 */
export async function buildNotifications(locale: string): Promise<AppNotification[]> {
  const fr = locale.startsWith("fr");
  const labels = fr ? DOC_LABELS_FR : DOC_LABELS_EN;
  const now = Date.now();
  const soon = 30 * DAY;

  const vehicles = await prisma.vehicle.findMany({ include: { documents: true } });

  type Flag = { plate: string; docType: string; expiry: Date; daysLeft: number };
  const flags: Flag[] = [];
  for (const v of vehicles) {
    for (const d of v.documents) {
      const daysLeft = Math.floor((d.expiryDate.getTime() - now) / DAY);
      if (d.expiryDate.getTime() - now <= soon) {
        flags.push({ plate: v.plateNumber, docType: d.docType, expiry: d.expiryDate, daysLeft });
      }
    }
  }
  flags.sort((a, b) => a.daysLeft - b.daysLeft);

  return flags.map((f, i) => {
    const label = labels[f.docType] ?? f.docType;
    const dateStr = f.expiry.toLocaleDateString(fr ? "fr-FR" : "en-GB");
    const detail =
      f.daysLeft < 0
        ? fr
          ? `Expiré depuis ${Math.abs(f.daysLeft)} j · ${dateStr}`
          : `Expired ${Math.abs(f.daysLeft)}d ago · ${dateStr}`
        : fr
          ? `Expire dans ${f.daysLeft} j · ${dateStr}`
          : `Expires in ${f.daysLeft}d · ${dateStr}`;
    return {
      id: `doc-${i}`,
      title: `${f.plate} — ${label}`,
      detail,
      when: f.expiry.toISOString(),
      severity: f.daysLeft < 0 ? "danger" : "warning",
    } as AppNotification;
  });
}
