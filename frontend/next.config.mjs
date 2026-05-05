/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // for deeplink forgot password mobile app
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        // Specify the path or API route where you want to disable caching
        source: '/api/respondent',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ],
      },
    ]
  },
};

export default nextConfig;
