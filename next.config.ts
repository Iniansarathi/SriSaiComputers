import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // Allow local network IP access for testing on phones and other devices
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.0.3:3000',
    '192.168.0.3',
    '192.168.1.36:3000',
    '192.168.1.36'
  ]
};

export default nextConfig;
