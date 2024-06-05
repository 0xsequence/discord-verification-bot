import { BasicConfigSchema, ConfigurationError, DiscordStyleSchema, FrondEndSecuritySchema, InfraConfigSchema, RequiredStringRule, RequiredUrlRule } from '@0xsequence/discord-bot-shared-utils';
import { globalLogger } from './global_logger';
import { z } from 'zod';

const compositeSchema = z.object({
    ...BasicConfigSchema.shape,
    ...InfraConfigSchema.shape,
    ...DiscordStyleSchema.shape,
    ...FrondEndSecuritySchema.shape,
});

const ownSchema = compositeSchema.extend({
    // Discord security
    APP_CLIENT_ID: RequiredStringRule,
    VERIFICATION_CHANNEL_ID: RequiredStringRule,

    // Front-end communication
    ISSUER: RequiredStringRule,
    VERIFICATION_PAGE_URL: RequiredStringRule,

    // Discord Messages Text
    NFT_MARKETPLACE: RequiredUrlRule,
    PUBLIC_EMBED_IMAGE_URL: RequiredUrlRule,
    BUCKET_NAME: RequiredStringRule,
});

const botConfigParseResult = ownSchema.safeParse(process.env);

if (!botConfigParseResult.success) {
    globalLogger.error('Failed to setup bot configuration', botConfigParseResult.error.issues);
    throw new ConfigurationError('There was an issue with the environment variables. Please check the values are filled correctly');
}

export const botConfig = botConfigParseResult.data;
