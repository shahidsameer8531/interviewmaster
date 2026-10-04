/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,  // Enable strict mode for better development experience

  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],  // Ensure Next.js recognizes TypeScript and JSX files

  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add src directory alias for easier imports
    config.resolve.alias['@'] = `${__dirname}/src`;
    config.resolve.alias['@interview-types'] = `${__dirname}/src/app/(marketing)/products/interview-questions/types.ts`;
    config.resolve.alias['@components'] = `${__dirname}/src/app/components`;
    config.resolve.alias['@public'] = `${__dirname}/public`;
    config.resolve.alias['@styles'] = `${__dirname}/src/styles`;
    config.resolve.alias['@utils'] = `${__dirname}/src/utils`;
    config.resolve.alias['@data'] = `${__dirname}/src/data`;
    config.resolve.alias['@hooks'] = `${__dirname}/src/hooks`;
    config.resolve.alias['@lib'] = `${__dirname}/src/lib`;
    config.resolve.alias['@models'] = `${__dirname}/src/models`;
    config.resolve.alias['@services'] = `${__dirname}/src/services`;

    // Handle client-side modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        stream: false,
        util: false,
      };
    }

    // Handle PDF.js requirements
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Add transpilation rule for cheerio
    config.module.rules.push({
      test: /node_modules\/cheerio.*\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-private-methods', '@babel/plugin-proposal-class-properties']
      }
    });

    return config;
  },

  // Temporary redirects from the old product routes to their Prep Room homes.
  // Non-permanent on purpose so they can change while the app settles.
  async redirects() {
    return [
      { source: '/products/mock-interviews/visual-simulation/:path*', destination: '/dashboard/interview/new', permanent: false },
      { source: '/products/mock-interviews/analyze', destination: '/dashboard/progress', permanent: false },
      { source: '/products/ai-feedback', destination: '/dashboard/interview/new', permanent: false },
      { source: '/products/aptitude', destination: '/dashboard/aptitude', permanent: false },
      { source: '/products/aptitude/:path*', destination: '/dashboard/aptitude', permanent: false },
      { source: '/products/aptitude-ai', destination: '/dashboard/aptitude', permanent: false },
      { source: '/products/aptitude-ai/:path*', destination: '/dashboard/aptitude', permanent: false },
      { source: '/products/resume-builder/features/ai', destination: '/dashboard/resume', permanent: false },
      { source: '/products/resume-builder/features/ai-resume', destination: '/dashboard/resume', permanent: false },
      { source: '/services/:service/professional', destination: '/dashboard/coaching', permanent: false },
    ];
  },

  // Experimental settings with valid structure for Turbopack
  experimental: {
    turbo: {
      rules: {
        '*.mdx': ['mdx-loader']
      },
    },
  },


  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,  // Ensure ESLint warnings don't block the build
  },

  // Image domains
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'www.gravatar.com',
      'res.cloudinary.com',
      'i.pravatar.cc',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'platform-lookaside.fbsbx.com',
      'i.ibb.co',
      'media.licdn.com',
      'pbs.twimg.com',
      'img.youtube.com',
      'img.freepik.com',
      'images.pexels.com',
      'images.ctfassets.net',
      'img.icons8.com',
      'cdn.pixabay.com',
      'cdn.jsdelivr.net',
      'cdn.dribbble.com',
      'cdn.shopify.com',
      'cdn.discordapp.com',
      'cdn.sanity.io',
      'cdn.hashnode.com',
      'cdn.buymeacoffee.com',
    ],
  },


  // Environment variables
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    STRIPE_URL_ENDPOINT: process.env.STRIPE_URL_ENDPOINT,
    GA_ID: process.env.GA_ID,
    HOSTING_URL: process.env.HOSTING_URL,
    MC_ID: process.env.MC_ID,
  },
};
