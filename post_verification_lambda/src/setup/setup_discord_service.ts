import { botConfig } from '../types/bot_config';
import { loggerConfig } from '../types/global_logger';
import { AccessConfig, DiscordConfig, DiscordService, GuildConfig } from '@0xsequence/discord-utils';

export function setupDiscordService(): DiscordService {
    const accessConfig: AccessConfig = {
        WebhookId: botConfig.WEBHOOK_ID,
        WebhookToken: botConfig.WEBHOOK_TOKEN,
        BotToken: botConfig.BOT_TOKEN,
    };

    const guildConfig: GuildConfig = {
        RoleId: botConfig.WALLET_VERIFIED_ROLE_ID,
        GuildId: botConfig.GUILD_ID,
    };

    const discordConfig: DiscordConfig = {
        GuildConfig: guildConfig,
        AccessConfig: accessConfig,
        NftRoleMapping: botConfig.NFT_ROLES ? JSON.parse(botConfig.NFT_ROLES) : undefined,
    };

    return new DiscordService(discordConfig, loggerConfig);
}
