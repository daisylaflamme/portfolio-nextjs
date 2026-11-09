import type { ReactNode } from "react";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.certificates);

export default function CertificatesLayout({ children }: { children: ReactNode }) {
  return children;
}
