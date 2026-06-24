import { getTranslations } from "next-intl/server";
import { Container } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) {
    redirect({ href: "/", locale });
  }

  const t = await getTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl brand-gradient text-white mb-3">
            <Container size={24} />
          </div>
          <h1 className="text-lg font-semibold text-fg">{t("title")}</h1>
          <p className="text-sm text-fg-muted mt-1">{t("subtitle")}</p>
        </div>
        <div className="rounded-xl border border-border-color bg-surface p-6">
          <LoginForm />
        </div>
        <p className="text-xs text-fg-subtle text-center mt-4">{t("demoHint")}</p>
      </div>
    </div>
  );
}
