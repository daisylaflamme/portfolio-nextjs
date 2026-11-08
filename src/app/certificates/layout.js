import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Education and Certificates",
  description:
    "Daisy Laflamme's degrees, training programs and certificates in front-end engineering, UX, accessibility, analytics and AI.",
  path: "/certificates",
});

export default function CertificatesLayout({ children }) {
  return children;
}
