import type { Metadata } from "next";
import { ArchiveTransition } from "./archive-transition";
import { CursorTrail } from "./cursor-trail";
import { DeviceTiltControl } from "./device-tilt-control";
import { InteractionAudio } from "./interaction-audio";
import { PointerBurst } from "./pointer-burst";
import { ScreenRipple } from "./screen-ripple";
import { SwarmWebsiteBuilder } from "./swarm/swarm-website-builder";
import { DESKTOP_QUERY, ENTRANCE_ATTRIBUTE, REDUCED_MOTION_QUERY, SWARM_SEEN_KEY } from "./swarm/availability";
import { SiteLanguageProvider } from "./site-language";
import "./globals.css";
import "./glass.css";

const siteOrigin =
  process.env.GITHUB_PAGES === "1"
    ? "https://springyearn.github.io"
    : "https://springyearn-portfolio.springyearn.chatgpt.site";

// Set the initial appearance before the document can paint. If hydration
// never takes over, release the entrance and leave the static site usable.
const entranceBootstrap = `(() => {
  if (location.pathname !== '/' || location.hash ||
      !matchMedia(${JSON.stringify(DESKTOP_QUERY)}).matches ||
      matchMedia(${JSON.stringify(REDUCED_MOTION_QUERY)}).matches) return;
  try { if (sessionStorage.getItem(${JSON.stringify(SWARM_SEEN_KEY)}) === '1') return; } catch {}
  const root = document.documentElement;
  const attribute = ${JSON.stringify(ENTRANCE_ATTRIBUTE)};
  root.setAttribute(attribute, 'boot');
  setTimeout(() => {
    if (root.getAttribute(attribute) === 'boot') root.removeAttribute(attribute);
  }, 5000);
})();`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: entranceBootstrap }} />
      </head>
      <body>
        <SiteLanguageProvider>{children}
        <ArchiveTransition />
        <DeviceTiltControl />
        <CursorTrail />
        <PointerBurst />
        <ScreenRipple />
        <InteractionAudio />
        <SwarmWebsiteBuilder />
        </SiteLanguageProvider>
      </body>
    </html>
  );
}
