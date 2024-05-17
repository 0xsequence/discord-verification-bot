import dotenv from 'dotenv';
import {
    BasicConfigSchema,
    ConfigurationError,
    DiscordStyleSchema,
    FrondEndSecuritySchema,
    InfraConfigSchema,
    OptionalStringRule,
    RequiredStringRule,
    RequiredUrlRule,
} from '@0xsequence/shared-utils';

import {z} from 'zod';

// TODO: ADD MISSING ENV VARS TO LAMBDA TEMPLATE
dotenv.config();

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
    PUBLIC_EMBED_BTN_LABEL: OptionalStringRule,
    PUBLIC_EMBED_TITLE: OptionalStringRule,
    PUBLIC_EMBED_DESCRIPTION: OptionalStringRule,
    PUBLIC_EMBED_FIELD_NAME: OptionalStringRule,
    PUBLIC_EMBED_FIELD_VALUE: OptionalStringRule,
    PUBLIC_EMBED_IMAGE_URL: RequiredUrlRule,

    WALLET_MANAGEMENT_TITLE: OptionalStringRule,
    WALLET_MANAGEMENT_DESCRIPTION: OptionalStringRule,
    WALLET_MANAGEMENT_FIELD_NAME: OptionalStringRule,
    WALLET_MANAGEMENT_FIELD_VALUE: OptionalStringRule,

    VERIFICATION_TITLE: OptionalStringRule,
    VERIFICATION_DESCRIPTION: OptionalStringRule,
    VERIFICATION_FIELD_NAME: OptionalStringRule,
    VERIFICATION_FIELD_VALUE: OptionalStringRule,

    WALLET_FOUND_DESCRIPTION: OptionalStringRule,
    WALLET_FOUND_FIELD_NAME: OptionalStringRule,
    WALLET_FOUND_FIELD_VALUE: OptionalStringRule,
    WALLET_NOT_FOUND_DESCRIPTION: OptionalStringRule,
    WALLET_NOT_FOUND_FIELD_NAME: OptionalStringRule,
    WALLET_NOT_FOUND_FIELD_VALUE: OptionalStringRule,
    BUCKET_NAME: RequiredStringRule,
});

const botConfigParseResult = ownSchema.safeParse(process.env);

if (!botConfigParseResult.success) {
    console.error(JSON.stringify(botConfigParseResult.error.issues));
    throw new ConfigurationError('There was an issue with the environment variables. Please check the values are filled correctly');
}

export const botConfig = botConfigParseResult.data;
