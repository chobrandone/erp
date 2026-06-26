"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function SearchBox({
  initialQuery,
  extraParams,
}: {
  initialQuery?: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery ?? "");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        if (v) params.set(k, v);
      }
    }
    if (value.trim()) params.set("q", value.trim());
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
      <input
        className="rounded-lg border border-border-color bg-surface-alt pl-8 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-200 w-56"
        placeholder={tc("searchPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
