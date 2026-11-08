import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.certificates);

export default function CertificatesLayout({ children }) {
  return children;
}
