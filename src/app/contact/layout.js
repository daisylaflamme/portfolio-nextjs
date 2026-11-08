import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with Daisy Laflamme, senior front-end and UI engineer based in Braintree, MA and available for remote work.",
  path: "/contact",
});

export default function ContactLayout({ children }) {
  return children;
}
