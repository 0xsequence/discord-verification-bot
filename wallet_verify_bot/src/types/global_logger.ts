import { initializeLogger, LoggerConfig, SequenceLogger } from '@0xsequence/shared-utils';
import dotenv from 'dotenv';

dotenv.config();

// DO NOT USE botConfig, as that one is using the logger and creates a circular dependency.
const loggerConfig: LoggerConfig = { environment: process.env.NODE_ENV, logLevel: process.env.LOG_LEVEL };
const globalLogger: SequenceLogger = initializeLogger('Wallet Verify Bot', loggerConfig);

export { globalLogger, loggerConfig };
