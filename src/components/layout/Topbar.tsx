import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { UserMenu } from "./UserMenu";

export function Topbar({
  title,
  subtitle,
  userName,
  userRole,
}: {
  title?: string;
  subtitle?: string;
  userName: string;
  userRole: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border-color bg-surface/80 backdrop-blur">
      <div className="min-w-0">
        {title && (
          <h1 className="text-base font-semibold text-fg truncate">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-fg-muted truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu userName={userName} userRole={userRole} />
      </div>
    </header>
  );
}
