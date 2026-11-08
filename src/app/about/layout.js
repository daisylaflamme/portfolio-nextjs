import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Senior UI / Front-End Engineer with over a decade of experience designing and building interfaces for large-scale e-commerce and complex systems.",
  path: "/about",
});

export default function AboutLayout({ children }) {
  return children;
}
