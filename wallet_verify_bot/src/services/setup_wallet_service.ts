import { botConfig } from '../types/bot_config';
import { loggerConfig } from '../types/global_logger';
import { DbConfig, WalletService } from '@0xsequence/discord-bot-wallet-utils';

function setupWalletService(): WalletService {
    if (botConfig.NODE_ENV && botConfig.NODE_ENV === 'dev-local') {
        const localDbConfig: DbConfig = {
            TableName: botConfig.DB_TABLE_NAME,
            Region: botConfig.REGION,
            Endpoint: 'http://localhost:8000',
            Key: botConfig.ACCESS_KEY,
            SecretKey: botConfig.SECRET_ACCESS_KEY,
        };

        return new WalletService(localDbConfig, loggerConfig);
    }

    // endpoint shouldn't be needed outside development, as is inferred by region.
    const dbConfig: DbConfig = { TableName: botConfig.DB_TABLE_NAME, Region: botConfig.REGION };
    return new WalletService(dbConfig, loggerConfig);
}

export { setupWalletService };
