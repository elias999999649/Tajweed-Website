import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // A static export has no Image Optimization API, so next/image must serve
  // the original asset. Without this the dev server throws on every page that
  // renders the symbols poster.
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { globalNotFound: true },
};

export default nextConfig;
