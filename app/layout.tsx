import type { Metadata } from "next";
import { ArchiveTransition } from "./archive-transition";
import { CursorTrail } from "./cursor-trail";
import { DeviceTiltControl } from "./device-tilt-control";
import { InteractionAudio } from "./interaction-audio";
import { PointerBurst } from "./pointer-burst";
import "./globals.css";

const siteOrigin =
  process.env.GITHUB_PAGES === "1"
    ? "https://springyearn.github.io"
    : "https://springyearn-portfolio.springyearn.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "SpringYearn",
  description:
    "The bilingual creative portfolio of SpringYearn, a Taiwan-based visual artist, designer and editor working across moving image, drawing, graphic design and 3D.",
  openGraph: {
    title: "SpringYearn — Editor / Motion Designer",
    description: "Visual rhythm, made tangible.",
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_TW",
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
    description: "Visual rhythm, made tangible.",
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
        {children}
        <ArchiveTransition />
        <DeviceTiltControl />
        <CursorTrail />
        <PointerBurst />
        <InteractionAudio />
      </body>
    </html>
  );
}
