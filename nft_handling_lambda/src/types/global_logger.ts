import { initializeLogger, LoggerConfig, SequenceLogger } from '@0xsequence/discord-bot-shared-utils';
import dotenv from 'dotenv';

dotenv.config();

// Cannot use botConfig as it uses this logger.
const loggerConfig: LoggerConfig = { environment: process.env.NODE_ENV, logLevel: process.env.LOG_LEVEL };
const globalLogger: SequenceLogger = initializeLogger('NFT Handling Lambda', loggerConfig);

export { globalLogger, loggerConfig };
