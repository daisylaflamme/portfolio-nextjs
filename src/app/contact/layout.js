import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.contact);

export default function ContactLayout({ children }) {
  return children;
}
