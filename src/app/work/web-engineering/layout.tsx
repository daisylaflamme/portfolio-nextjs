import type { ReactNode } from "react";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.work);

export default function WorkLayout({ children }: { children: ReactNode }) {
  return children;
}
