import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Project Files — SpringYearn",
  description: "Free After Effects and DaVinci Resolve project files by SpringYearn, with video previews and public downloads.",
};

export default function ProjectFilesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
