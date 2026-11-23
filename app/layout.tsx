import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SiteLanguageProvider } from "./site-language";
import { SiteCursor } from "./site-cursor";
import { ScrollPanels } from "./scroll-panels";
import "./globals.css";
import "./editorial.css";
import "./interactions.css";

const siteOrigin =
  process.env.GITHUB_PAGES === "1"
    ? "https://springyearn.github.io"
    : "https://springyearn-portfolio.springyearn.chatgpt.site";

const googleFonts = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=LXGW+WenKai+TC:wght@300;400;700&family=Syne:wght@400..800&display=swap";
const fontshare = "https://api.fontshare.com/v2/css?f%5B%5D=satoshi@300,400,500,700,900&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "SpringYearn",
  description:
    "SpringYearn’s portfolio: editing, motion, drawing, graphic design and 3D, made in Taiwan.",
  openGraph: {
    title: "SpringYearn — Editor / Motion Designer",
    description: "Editing, motion, design and a few experiments along the way.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW","ja_JP","ko_KR","ru_RU","vi_VN"],
    images: [
      {
        url: `${siteOrigin}/og.png`,
        width: 1200,
        height: 630,
        alt: "SpringYearn — Editor / Motion Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpringYearn — Editor / Motion Designer",
    description: "Editing, motion, design and a few experiments along the way.",
    images: [`${siteOrigin}/og.png`],
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFonts} />
        <link rel="stylesheet" href={fontshare} />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}
          storageKey="springyearn:theme" themes={["dark", "light"]}>
          <SiteLanguageProvider>
            <SiteCursor />
            <ScrollPanels />
            {children}
          </SiteLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
