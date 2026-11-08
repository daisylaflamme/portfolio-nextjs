import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Case studies by Daisy Laflamme: multi-brand e-commerce UI, checkout and payments, accessibility-first components, maps, CMS tools and AI products.",
  path: "/web-projects",
});

export default function WorkLayout({ children }) {
  return children;
}
