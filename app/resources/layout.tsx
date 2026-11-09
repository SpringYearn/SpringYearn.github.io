import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Resources — SpringYearn",
  description: "Free After Effects and DaVinci Resolve project files, plus LAB tools and development records by SpringYearn.",
  alternates: { canonical: "/resources/" },
};

export default function ResourcesLayout({ children }: Readonly<{ children: ReactNode }>) { return children; }
