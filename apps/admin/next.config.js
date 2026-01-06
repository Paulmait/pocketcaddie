/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure service_role is NEVER exposed to the browser
  // All Supabase admin calls must happen in Server Components or Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
