import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf"],
  // The dev server is opened at 127.0.0.1. Without this, Next blocks the
  // dev runtime and the page stays as static HTML.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
