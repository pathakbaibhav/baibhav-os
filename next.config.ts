import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile higher up the tree otherwise
  // makes Next.js trace files from the wrong directory.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
