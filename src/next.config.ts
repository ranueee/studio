import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow data URIs from AI image generation
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: 'inline',
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'placehold.co',
            port: '',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
            port: '',
            pathname: '/**',
        },
    ],
    // This is to allow for data: urls from the AI image generation
    unoptimized: true
  },
};

export default nextConfig;
