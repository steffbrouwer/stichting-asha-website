import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Voeg hier de domeinen toe waarvan je afbeeldingen wilt laden
  },
};

module.exports = {
  distDir: 'build',
}

export default nextConfig;
