import type { ReactNode } from "react";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.about);

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
