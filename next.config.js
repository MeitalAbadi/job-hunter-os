/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security: ensure server-side env vars never leak to client
  serverRuntimeConfig: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  publicRuntimeConfig: {},
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
