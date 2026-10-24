import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SITE_DESCRIPTION, SITE_URL, titleFor } from "@/lib/routes";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
