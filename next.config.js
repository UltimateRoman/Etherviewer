/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TOKEN: process.env.TOKEN
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
