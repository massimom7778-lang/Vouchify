/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Drops the `X-Powered-By: Next.js` response header. It tells nobody
  // anything useful and hands an attacker one free fact about the stack.
  poweredByHeader: false,
};

export default nextConfig;
