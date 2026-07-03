/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Netlify deployment
  output: undefined,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
