/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'uploadthing.com',
        pathname: '/**'
      },
      {
        hostname: 'utfs.io',
        pathname: '/**'
      },
      {
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
