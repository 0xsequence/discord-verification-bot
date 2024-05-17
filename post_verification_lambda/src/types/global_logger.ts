import { initializeLogger, LoggerConfig, SequenceLogger } from '@0xsequence/shared-utils';
import dotenv from 'dotenv';

dotenv.config();

const loggerConfig: LoggerConfig = { environment: process.env.NODE_ENV, logLevel: process.env.LOG_LEVEL };
const globalLogger: SequenceLogger = initializeLogger('Post-Verification Lambda', loggerConfig);

export { globalLogger, loggerConfig };
