import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        trailingSlash: true,
        typescript: {
          tsconfigPath: "tsconfig.github.json",
        },
      }
    : {}),
};

export default nextConfig;
