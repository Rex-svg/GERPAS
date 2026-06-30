import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Required for GitHub Pages
  output: "export",

  // Disable Next.js image optimization
  images: {
    unoptimized: true,
  },

  // Replace "YOUR_REPOSITORY_NAME" with your GitHub repository name
  basePath: isProd ? "/GERPAS/" : "",
  assetPrefix: isProd ? "/GERPAS/" : "",
};

export default nextConfig;
