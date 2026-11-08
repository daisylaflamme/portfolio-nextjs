import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows quality 75 by default; the case-study gallery uses 90.
    qualities: [75, 90],
  },
};

export default nextConfig;
