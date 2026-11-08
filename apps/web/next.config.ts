import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript validation is enabled in builds and enforced by CI/CD.
  // The experimental useTypeScriptCli is disabled due to Next.js 16.3.1
  // compatibility with the workspace build environment.
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    useTypeScriptCli: false,
  },
  async headers() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self' ${apiOrigin} https://routing.openstreetmap.de; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
