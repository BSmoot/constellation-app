import { NextConfig } from 'next'

const config: NextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["*"] // or specify your allowed origins
        },
    },
}

export default config