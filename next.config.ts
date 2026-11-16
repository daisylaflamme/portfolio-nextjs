import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows quality 75 by default; the case-study gallery uses 90.
    qualities: [75, 90],
  },
  async redirects() {
    return [
      // The Work page moved under /work; old links (including ?project=<id>) keep working.
      { source: "/web-projects", destination: "/work/web-engineering", permanent: true },
      { source: "/work", destination: "/work/web-engineering", permanent: false },
      // The retail dashboard was renamed from Larry’s Secret to Larry’s Stores; the query string carries over.
      { source: "/work/dashboards/larrys-secret", destination: "/work/dashboards/larrys-stores", permanent: true },
      // Education moved into the About page.
      { source: "/certificates", destination: "/about#education", permanent: true },
    ];
  },
};

export default nextConfig;
