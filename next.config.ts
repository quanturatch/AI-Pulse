import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "cdn.openai.com" },
      { protocol: "https", hostname: "**.anthropic.com" },
      { protocol: "https", hostname: "huggingface.co" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "**.medium.com" },
    ],
  },
};

export default nextConfig;