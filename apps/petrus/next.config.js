// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// const withPlugins = require('next-compose-plugins');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Adicione esta linha para resolver problemas de animação
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_INVITE_LINK: process.env.NEXT_PUBLIC_INVITE_LINK,
    NEXT_PUBLIC_GITHUB_LINK: process.env.NEXT_PUBLIC_GITHUB_LINK,
    NEXT_PUBLIC_TWITTER_LINK: process.env.NEXT_PUBLIC_TWITTER_LINK,
  },
  // Otimizações para Framer Motion
  compiler: {
    styledComponents: true,
  },
  // Melhor suporte a Webpack para animações
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
