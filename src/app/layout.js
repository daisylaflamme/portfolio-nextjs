import "./globals.css";
import { Suspense } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ResumeVisitTracker from "@/components/ResumeVisitTracker";
import { themeInitScript } from "@/lib/theme";
import { PAGES, SITE_NAME, SITE_URL } from "@/lib/seo";

// Self-hosted by next/font: no render-blocking Google Fonts request, no layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter-var", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-var", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-var", display: "swap" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
  ],
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PAGES.home.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: PAGES.home.description,
  icons: {
    icon: [
      { url: "/images/daisy.ico", sizes: "48x48" },
      { url: "/images/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: PAGES.home.title,
    description:
      "Design-minded engineer for commerce, marketing and product UI. Case studies in multi-brand e-commerce, payments, accessibility and design systems.",
    url: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-fg">
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </div>
        <SiteFooter />
        <Suspense fallback={null}>
          <ResumeVisitTracker />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
