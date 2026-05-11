import type { NextConfig } from 'next';

// Tailwind CSS v4 with @tailwindcss/postcss configuration
const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
