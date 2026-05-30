import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "axis — 결정 AI",
  description: "비교가 아니라 결정을 내리는 AI"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
