/** @type {import('next').NextConfig} */
const nextConfig = {
  // No output specified - runs as server (not static export)
  
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

  // Rewrites only for local development
  // In production, Apache handles all proxying
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:5000/:path*',
        },
        {
          source: '/auth/:path*',
          destination: 'http://127.0.0.1:5000/auth/:path*',
        },
        {
          source: '/admin/:path*',
          destination: 'http://127.0.0.1:5000/admin/:path*',
        },
        {
          source: '/health',
          destination: 'http://127.0.0.1:5000/health',
        },
        {
          source: '/upload-:path*',
          destination: 'http://127.0.0.1:5000/upload-:path*',
        },
        {
          source: '/stream-text-to-speech',
          destination: 'http://127.0.0.1:5000/stream-text-to-speech',
        },
        {
          source: '/getPrompt',
          destination: 'http://127.0.0.1:5000/getPrompt',
        },
        {
          source: '/chngPrompt',
          destination: 'http://127.0.0.1:5000/chngPrompt',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig;