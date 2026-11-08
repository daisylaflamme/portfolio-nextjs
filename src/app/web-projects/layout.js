import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(PAGES.work);

export default function WorkLayout({ children }) {
  return children;
}
