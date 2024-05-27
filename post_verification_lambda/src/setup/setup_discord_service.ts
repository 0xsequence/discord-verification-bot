import { botConfig } from '../types/bot_config';
import { loggerConfig } from '../types/global_logger';
import { AccessConfig, DiscordConfig, DiscordService } from '@0xsequence/discord-utils';

export function setupDiscordService(): DiscordService {
    const accessConfig: AccessConfig = {
        WebhookId: botConfig.WEBHOOK_ID,
        WebhookToken: botConfig.WEBHOOK_TOKEN,
        BotToken: botConfig.BOT_TOKEN,
    };

    const discordConfig: DiscordConfig = {
        GuildId: botConfig.GUILD_ID,
        AccessConfig: accessConfig,
        NftRoleMapping: botConfig.NFT_ROLES ? JSON.parse(botConfig.NFT_ROLES) : undefined,
    };

    return new DiscordService(discordConfig, loggerConfig);
}
