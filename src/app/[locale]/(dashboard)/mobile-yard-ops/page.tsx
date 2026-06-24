import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Smartphone, ScanLine, RefreshCw, Camera, ClipboardCheck, Snowflake } from "lucide-react";

export default async function MobileYardOpsPage() {
  const t = await getTranslations("mobile");

  const features = [
    { icon: ScanLine, label: t("feature1") },
    { icon: RefreshCw, label: t("feature2") },
    { icon: Camera, label: t("feature3") },
    { icon: ClipboardCheck, label: t("feature4") },
    { icon: Snowflake, label: t("feature5") },
  ];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="rounded-xl border border-dashed border-border-color bg-surface p-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient text-white mb-6 mx-auto">
          <Smartphone size={28} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border-color bg-surface-alt px-4 py-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg brand-gradient text-white shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-fg">{f.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-fg-muted max-w-xl mx-auto text-center">{t("roadmapNote")}</p>
      </div>
    </div>
  );
}
