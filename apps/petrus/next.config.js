//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '**', // permite qualquer caminho dentro do domínio
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '**', // permite qualquer caminho dentro do domínio
      },
    ],
  },
  env: {
    NEXT_PUBLIC_INVITE_LINK: process.env.NEXT_PUBLIC_INVITE_LINK,
    NEXT_PUBLIC_GITHUB_LINK: process.env.NEXT_PUBLIC_GITHUB_LINK,
    NEXT_PUBLIC_TWITTER_LINK: process.env.NEXT_PUBLIC_TWITTER_LINK
  },
  nx: {},
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
