/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev/local macOS use NEXT_DIST_DIR (see scripts/dev-start.sh, build:local).
  // Vercel always reads routes-manifest.json from .next — never override there.
  distDir: process.env.VERCEL ? '.next' : (process.env.NEXT_DIST_DIR || '.next'),
  reactStrictMode: true,
  transpilePackages: ['leaflet', 'maplibre-gl'],
  // Smaller dev + prod bundles when importing many icons from lucide-react.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'leaflet',
      'maplibre-gl',
    ],
  },
  images: {
    // Serve responsive sizes via the Next.js optimizer (respects `sizes` on <Image />).
    // If you see 502/timeouts on large originals in production, set unoptimized: true
    // and enable Supabase Storage transforms (Pro) plus NEXT_PUBLIC_USE_SUPABASE_IMAGE_TRANSFORM=true.
    unoptimized: false,
    // Must include every `quality` passed to <Image /> (see ListingImage VARIANT_QUALITY).
    qualities: [68, 72, 75, 78],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Add device sizes for better optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increase timeout for image optimization (30 seconds)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dqnrofcmtxwppiywscuw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow any Supabase project storage URLs (for flexibility)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/render/image/public/**',
      },
      // Allow Unsplash images (for stock photos)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Uplisting property photos (served via CloudFront after API sync)
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

