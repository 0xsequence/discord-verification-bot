import { botConfig } from '../types/bot_config';
import { DbConfig, WalletService } from '@0xsequence/wallet-utils';
import { loggerConfig } from '../types/global_logger';

function setupWalletService(): WalletService {
    if (botConfig.NODE_ENV && botConfig.NODE_ENV === 'dev-local') {
        const localDbConfig: DbConfig = {
            TableName: botConfig.DB_TABLE_NAME,
            Region: botConfig.REGION,
            Endpoint: 'http://bot-dynamodb-local:8000',
        };

        return new WalletService(localDbConfig, loggerConfig);
    }

    // endpoint shouldn't be needed outside development, as is inferred by region.
    const dbConfig: DbConfig = { TableName: botConfig.DB_TABLE_NAME, Region: botConfig.REGION };
    return new WalletService(dbConfig, loggerConfig);
}

export { setupWalletService };
