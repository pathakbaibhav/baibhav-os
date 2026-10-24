import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_URL, titleFor } from "@/lib/routes";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Self-hosted variable fonts (OFL, via @fontsource): no build-time download
// from Google Fonts, which CI runners can't always reach.
const interTight = localFont({
  src: "../../node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  variable: "--font-inter-tight",
  weight: "100 900",
  display: "swap",
});

const jetbrains = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: titleFor(null),
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "baibhavOS", title: titleFor(null), description: SITE_DESCRIPTION, url: "/" },
};

export const viewport: Viewport = {
  themeColor: "#070A11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${interTight.variable} ${jetbrains.variable}`}>{children}</body>
    </html>
  );
}
