"use client";

import { usePathname } from "next/navigation";

function getSubtitle(pathname) {
  if (pathname === "/web-projects") return "Web Projects";
  if (pathname === "/resume") return "Resume";
  if (pathname === "/contact") return "Let's Connect!";
  return "User Interface Portfolio";
}

export default function Header() {
  const pathname = usePathname();
  const subtitle = getSubtitle(pathname);

  return (
    <header className="py-4 text-center">
      <h1 className="font-playfair-display font-medium text-3xl mt-5 mb-5">Daisy Laflamme</h1>
      <h2 className="font-inter font-medium text-lg text-font-secondary">{subtitle}</h2>
    </header>
  );
}
