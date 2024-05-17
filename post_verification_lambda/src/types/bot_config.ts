import {
    BasicConfigSchema,
    ConfigurationError,
    DiscordStyleSchema,
    InfraConfigSchema,
    OptionalStringRule,
    RequiredStringRule,
    RequiredUrlRule,
} from '@0xsequence/shared-utils';
import {globalLogger} from './global_logger';
import {z} from 'zod';

const compositeSchema = z.object({
    ...BasicConfigSchema.shape,
    ...InfraConfigSchema.shape,
    ...DiscordStyleSchema.shape,
});

// TODO: ADD MISSING ENV VARS TO LAMBDA TEMPLATE
const ownSchema = compositeSchema.extend({
    WEBHOOK_ID: RequiredStringRule,
    WEBHOOK_TOKEN: RequiredStringRule,

    // Discord Roles
    NFT_ROLES: OptionalStringRule,

    // Discord Messages Text
    ACCOUNT_ALREADY_LINKED_TITLE: OptionalStringRule,
    ACCOUNT_ALREADY_LINKED_DESCRIPTION: OptionalStringRule,
    ACCOUNT_LINKED_SUCCESS_TITLE: OptionalStringRule,
    ACCOUNT_LINKED_SUCCESS_DESCRIPTION: OptionalStringRule,
    ACCOUNT_LINKED_SUCCESS_OWNER_FIELD_NAME: OptionalStringRule,
    ACCOUNT_LINKED_SUCCESS_NON_OWNER_FIELD1_VALUE: OptionalStringRule,
    ACCOUNT_LINKED_SUCCESS_NON_OWNER_FIELD2_VALUE: OptionalStringRule,
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
