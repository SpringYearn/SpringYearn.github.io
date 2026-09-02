import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SpringYearn",
  description: "APP / UI, editing, motion, 3D, drawing and graphic work by SpringYearn.",
};

export default function WorkLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
