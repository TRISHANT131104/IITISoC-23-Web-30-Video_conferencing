/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images : {
    remotePatterns:[
      {
        hostname:"www.htmlhints.com"
      }
    ]
  }
}

module.exports = nextConfig
