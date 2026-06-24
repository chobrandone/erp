"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t("lightMode") : t("darkMode")}
      title={isDark ? t("lightMode") : t("darkMode")}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-fg-muted hover:bg-surface-alt hover:text-fg transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
