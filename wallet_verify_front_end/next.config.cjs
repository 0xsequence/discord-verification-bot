/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    experimental:{
        serverComponentsExternalPackages: ['pino', 'pino-pretty']
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: `${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com`,
                port: '',
            },
        ],
    }
};

module.exports = nextConfig;
