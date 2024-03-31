/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    APOLLO_GRAPHQL_SERVER_BASE_URL: process.env.APOLLO_GRAPHQL_SERVER_BASE_URL,
  },
};

module.exports = nextConfig;
