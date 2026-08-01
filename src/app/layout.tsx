import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Negoce Services",
  description: "Negoce Services — Container Yard Management System",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Negoce Services", statusBarStyle: "black-translucent" },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-full antialiased">
        {/* Runs before hydration to set the theme class and avoid a flash of the wrong theme. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
