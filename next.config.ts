import type { NextConfig } from "next";

<<<<<<< HEAD
const nextConfig: NextConfig = {
  cacheComponents:true,
  reactCompiler:true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "vedvzdqvtcsrgxdifhiq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      }
    ],
=======
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    domains: ["placehold.co","zgxuxtqkrlqrmdukfohi.supabase.co", ...(supabaseHostname ? [supabaseHostname] : [])],
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
  },
};

export default nextConfig;
