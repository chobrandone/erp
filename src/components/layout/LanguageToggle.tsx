"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: "en" | "fr") {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-color p-0.5">
      <Languages size={14} className="text-fg-subtle ml-1.5" />
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-1 text-xs font-semibold rounded-md uppercase transition-colors ${
            locale === l
              ? "brand-gradient text-white"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
