/** @type {import('next').NextConfig} */
const nextConfig = {
  // <--- Add this for static export

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  },

  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  experimental: {
    // You can keep this empty or add experimental features
  },

  allowedDevOrigins: [
    '192.168.100.5',
    '192.168.100.34',
    '219504692f12.ngrok-free.app/',
    'localhost',
    '127.0.0.1',
    '192.168.1.1',
    '192.168.1.100',
    '192.168.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '172.26.32.1',
    'theneutralai.com',
  ],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/:path*', // points frontend API requests to your backend
      },
    ];
  },
}

module.exports = nextConfig;
