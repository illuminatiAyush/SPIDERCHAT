import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds on Vercel to avoid
  // deployment failures due to tooling config issues.
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            // Allow images from any source for avatars, allow websockets, allow google fonts
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * data: blob:; connect-src *; font-src 'self' data: https://fonts.gstatic.com;",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
