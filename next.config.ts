import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    cacheComponents: true,
    images : {
        remotePatterns : [
            {
                protocol : "https",
                hostname: "res.cloudinary.com",
            }
        ]
    }
  /* config options here */
    // experimental: {
    //     turbo: false, // Disable Turbopack
    // },
};

export default nextConfig;
