import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LAB / Experiments — SpringYearn",
  description: "DaVinci Resolve and Fusion tools, prototypes and development records by SpringYearn.",
};

export default function LabLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
