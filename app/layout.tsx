import type { Metadata } from "next";
import { ArchiveTransition } from "./archive-transition";
import { CursorTrail } from "./cursor-trail";
import { DeviceTiltControl } from "./device-tilt-control";
import { InteractionAudio } from "./interaction-audio";
import { PointerBurst } from "./pointer-burst";
import { SiteLanguageProvider } from "./site-language";
import "./globals.css";

const siteOrigin =
  process.env.GITHUB_PAGES === "1"
    ? "https://springyearn.github.io"
    : "https://springyearn-portfolio.springyearn.chatgpt.site";

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
    <html lang="en">
      <body>
        <SiteLanguageProvider>{children}
        <ArchiveTransition />
        <DeviceTiltControl />
        <CursorTrail />
        <PointerBurst />
        <InteractionAudio />
        </SiteLanguageProvider>
      </body>
    </html>
  );
}
