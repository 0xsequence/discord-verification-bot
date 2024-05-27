import {
    BasicConfigSchema,
    ConfigurationError,
    DiscordStyleSchema,
    InfraConfigSchema,
    OptionalStringRule,
    RequiredStringRule,
    RequiredUrlRule,
} from '@0xsequence/shared-utils';
import { globalLogger } from './global_logger';
import { z } from 'zod';

const compositeSchema = z.object({
    ...BasicConfigSchema.shape,
    ...InfraConfigSchema.shape,
    ...DiscordStyleSchema.shape,
});

const ownSchema = compositeSchema.extend({
    WEBHOOK_ID: RequiredStringRule,
    WEBHOOK_TOKEN: RequiredStringRule,
    NFT_ROLES: OptionalStringRule,
    NFT_MARKETPLACE: RequiredUrlRule,
});

const botConfigParseResult = ownSchema.safeParse(process.env);
if (!botConfigParseResult.success) {
    globalLogger.error('Failed to setup bot configuration', botConfigParseResult.error.issues);
    throw new ConfigurationError(
        'There was an issue with the environment variables. Please check the values are filled correctly',
    );
}

export const botConfig = botConfigParseResult.data;
