"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { inputClass } from "@/components/shared/FormSection";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("email")}</label>
        <input
          type="email"
          required
          autoFocus
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@depot.local"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1.5">{t("password")}</label>
        <input
          type="password"
          required
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="brand-gradient text-white font-medium text-sm w-full py-2.5 rounded-lg disabled:opacity-60"
      >
        {submitting ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
