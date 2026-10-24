import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Shown in Settings → About this OS. Vercel provides the commit; locally ask git.
function commit(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile higher up the tree otherwise
  // makes Next.js trace files from the wrong directory.
  outputFileTracingRoot: __dirname,
  env: {
    NEXT_PUBLIC_BUILD_SHA: commit(),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
};

export default nextConfig;
