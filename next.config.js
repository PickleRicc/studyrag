/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://*.openai.com https://*.pinecone.io https://*.blob.core.windows.net"
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig
