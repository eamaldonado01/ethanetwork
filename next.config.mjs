/* next.config.mjs */

/**  @typedef {import('next').NextConfig}                    NextConfig */
/**  @typedef {import('next/dist/shared/lib/image-config').RemotePattern} RemotePattern */

/* ─── optional S3 env vars ─────────────────────────────────────────── */
const { S3_BUCKET, S3_REGION } = process.env;

/* ─── remote image patterns ───────────────────────────────────────── */
 /** @type {RemotePattern[]} */
const remotePatterns = [
  { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
];

if (S3_BUCKET && S3_REGION) {
  remotePatterns.push({
    protocol: 'https',
    hostname: `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`,
    pathname: '/**',
  });
}

/** @type {NextConfig} */
const nextConfig = {
  /* generic settings */
  output: 'standalone',
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },

  /* external images */
  images: { remotePatterns },

  /* webpack tweaks (unchanged) */
  webpack(config) {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [{ loader: 'graphql-tag/loader' }],
    });
    return config;
  },

  /* /login → Auth0 SDK route */
  async rewrites() {
    return [
      { source: '/login', destination: '/api/auth/login?prompt=login' },
    ];
  },
};

export default nextConfig;
