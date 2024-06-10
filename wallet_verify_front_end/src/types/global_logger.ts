import {pino} from 'pino';

export const globalLogger = pino({
    name: 'Wallet Verify Front-End',
    level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});