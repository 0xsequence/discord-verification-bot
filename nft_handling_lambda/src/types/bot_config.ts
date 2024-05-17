import {
    BasicConfigSchema,
    ConfigurationError,
    DiscordStyleSchema,
    InfraConfigSchema,
    OptionalStringRule,
    RequiredStringRule,
} from '@0xsequence/shared-utils';
import {z} from 'zod';
import {globalLogger} from './global_logger';

const compositeSchema = z.object({
    ...BasicConfigSchema.shape,
    ...InfraConfigSchema.shape,
    ...DiscordStyleSchema.shape,
});

// TODO: ADD MISSING ENV VARS TO LAMBDA TEMPLATE
const ownSchema = compositeSchema.extend({
    WEBHOOK_ID: RequiredStringRule,
    WEBHOOK_TOKEN: RequiredStringRule,
    NFT_ROLES: OptionalStringRule,
    OWNERSHIP_UPDATED_TITLE: OptionalStringRule,
    PREVIOUS_HOLDER_DESCRIPTION: OptionalStringRule,
    NEW_HOLDER_DESCRIPTION: OptionalStringRule,
    FIELD1_NAME: OptionalStringRule,
    FIELD1_VALUE: OptionalStringRule,
    FIELD2_VALUE: OptionalStringRule,
});

const botConfigParseResult = ownSchema.safeParse(process.env);
if (!botConfigParseResult.success) {
    globalLogger.error('Failed to setup bot configuration', botConfigParseResult.error.issues);
    throw new ConfigurationError(
        'There was an issue with the environment variables. Please check the values are filled correctly',
    );
}

export const botConfig = botConfigParseResult.data;
