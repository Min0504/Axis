import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Axis — 결정 AI",
    template: "%s — Axis"
  },
  description: "비교가 아니라 결정을 내리는 AI",
  applicationName: "Axis",
  openGraph: {
    title: "Axis — 결정 AI",
    description: "비교가 아니라 결정을 내리는 AI",
    url: siteUrl,
    siteName: "Axis",
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Axis — 결정 AI",
    description: "비교가 아니라 결정을 내리는 AI"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
