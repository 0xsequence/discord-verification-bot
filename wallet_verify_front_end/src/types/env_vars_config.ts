import {
    ConfigurationError,
    FrondEndSecuritySchema,
    InfraConfigSchema,
    OptionalStringRule,
    RequiredStringRule,
    RequiredUrlRule,
} from '@0xsequence/shared-utils';
import {z} from 'zod';
import {globalLogger} from "@/types/global_logger";

const compositeSchema = z.object({
    ...InfraConfigSchema.shape,
    ...FrondEndSecuritySchema.shape,
});

const ownSchema = compositeSchema.extend({
    WALLET_VERIFIED_TOPIC_ARN: RequiredStringRule,
    NETWORK: RequiredStringRule,
    NEXT_PUBLIC_BUCKET_NAME: RequiredStringRule,

    // Front-end Text
    NEXT_PUBLIC_INDEX_TITLE: RequiredUrlRule,
    NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_APP_NAME: RequiredStringRule,
    NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_THEME: OptionalStringRule, // TODO IMPROVEMENT: enum
    NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_BANNER_URL: RequiredUrlRule,
    NEXT_PUBLIC_CONNECT_WALLET_MAIN_MESSAGE: OptionalStringRule,
    NEXT_PUBLIC_DONE_ICON_URL: RequiredUrlRule,
    NEXT_PUBLIC_WARN_ICON_URL: RequiredUrlRule,
    NEXT_PUBLIC_LOGO_URL: RequiredUrlRule,
    NEXT_PUBLIC_BACKGROUND_IMAGE_URL: RequiredUrlRule,
}).omit({ DB_TABLE_NAME: true });

const configParseResult = ownSchema.safeParse(process.env);
if (!configParseResult.success) {
    globalLogger.error(JSON.stringify(configParseResult.error.issues));
    throw new ConfigurationError(
        'There was an issue with the environment variables. Please check the values are filled correctly',
    );
}

// Make environment variables typed and available on the process.env
type OwnSchema = z.infer<typeof ownSchema>;

declare global {
    // eslint-disable-next-line no-unused-vars
    namespace NodeJS {
        // eslint-disable-next-line no-unused-vars
        interface ProcessEnv extends OwnSchema {}
    }
}
