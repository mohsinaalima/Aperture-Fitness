import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("API_URL must be set to the deployed FastAPI URL.");
      }

      return [];
    }

    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
