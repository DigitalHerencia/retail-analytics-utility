/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },


  experimental: {
    reactCompiler: true, // Example: Enable the experimental React Compiler
   },
};

export default nextConfig;
