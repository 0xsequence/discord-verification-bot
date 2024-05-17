import {Logger, pino} from 'pino';

export const globalLogger:Logger = pino({
    name: 'Wallet Verify Front-End',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
});