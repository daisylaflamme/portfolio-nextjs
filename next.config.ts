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
    ];
  },
};

export default nextConfig;
