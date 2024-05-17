import { initializeLogger, LoggerConfig, SequenceLogger } from '@0xsequence/shared-utils';
import { botConfig } from './bot_config';

const loggerConfig: LoggerConfig = { environment: botConfig.NODE_ENV, logLevel: botConfig.LOG_LEVEL };
const globalLogger: SequenceLogger = initializeLogger('Wallet Verify Bot', loggerConfig);

export { globalLogger, loggerConfig };
