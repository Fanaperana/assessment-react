import type { NextConfig } from "next";
import { randomBytes } from "node:crypto";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/id/**",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Keep profile metadata in <head> for crawlers and Lighthouse.
  htmlLimitedBots: /.*/,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default function config(phase: string): NextConfig {
  // A build has no sessions; generate a throwaway secret for static analysis in CI.
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.BETTER_AUTH_SECRET) {
    process.env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
  }
  return {
    ...nextConfig,
    // Next 16.4 dev route matching misreads the modal catch-all across route groups.
    deprecated:
      phase === PHASE_DEVELOPMENT_SERVER
        ? { looseRouteMatching: true }
        : undefined,
  };
}
