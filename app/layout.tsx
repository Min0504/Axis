import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import ServiceWorkerRegistrar from "@/components/service-worker-registrar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t.siteName} — ${t.siteTagline}`,
      template: `%s — ${t.siteName}`
    },
    description: t.siteDescription,
    applicationName: t.siteName,
    openGraph: {
      title: `${t.siteName} — ${t.siteTagline}`,
      description: t.siteDescription,
      url: siteUrl,
      siteName: t.siteName,
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `${t.siteName} — ${t.siteTagline}`,
      description: t.siteDescription
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
        ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
        : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111111" />
        <meta name="naver-site-verification" content="707805c4c2cdea34c31b2bcc7824e63b69c682b2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('axis-theme');
                  var preferred = saved || 'light';
                  document.documentElement.setAttribute('data-theme', preferred);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider initialLocale={locale}>{children}</ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
