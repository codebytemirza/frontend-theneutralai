/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    
  },
  
  // Allow cross-origin requests from local network IPs (strings only)
  allowedDevOrigins: [
    '192.168.100.5',
    '192.168.100.34',
    '219504692f12.ngrok-free.app/',  // Added for cross-origin access
    'localhost',
    '127.0.0.1',
    // Add other specific IPs you might use
    '192.168.1.1',
    '192.168.1.100',
    '192.168.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '172.26.32.1',
  ],
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://66.102.139.243:5000/:path*',
      },
    ];
  },
}

module.exports = nextConfig