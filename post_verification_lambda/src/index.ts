import { SNSEvent, SNSHandler } from 'aws-lambda';
import { EmbedBuilder } from 'discord.js';
import { botConfig } from './types/bot_config';
import { colors } from './types/color';
import { globalLogger as logger } from './types/global_logger';

import { setupDiscordService } from './setup/setup_discord_service';
import { setupWalletService } from './setup/setup_wallet_service';

import { WalletService, WalletVerification } from '@0xsequence/wallet-utils';
import { DiscordService } from '@0xsequence/discord-utils';

const discordService: DiscordService = setupDiscordService();
const walletService: WalletService = setupWalletService();

// AWS Lambda's Node runtime does not support typescript yet,
// //you have to transpile your code before deploying.
// TODO CI: Make sure you have correct tsconfig and do npm (or yarn) build before you deploy the lambda
export const handler: SNSHandler = async (event: SNSEvent): Promise<void> => {
    logger.info('Received event: ', event);

    try {
        const walletVerifiedMessage: WalletVerification = JSON.parse(event.Records[0].Sns.Message);
        logger.debug('walletVerifiedMessage: ', walletVerifiedMessage);
        const userAlreadyVerified = await isRepeatedVerificationAttempt(walletVerifiedMessage);

        const userId = walletVerifiedMessage.UserId;
        const threadId = walletVerifiedMessage.ThreadId;

        if (userAlreadyVerified) {
            logger.warn(`Ignoring repeated attempt to verify by Discord user ${userId}`);
            return;
        }

        const wallet = await walletService.saveDiscordWalletVerification(walletVerifiedMessage);

        if (wallet != null) {
            await discordService.assignAccountVerifiedRole(userId, botConfig.WALLET_VERIFIED_ROLE_ID);

            const ownedNftSeries = walletService.getUniqueWalletNftsSeries(wallet.Nfts);
            const isNFTHolder = ownedNftSeries != null && ownedNftSeries.length > 0;

            if (isNFTHolder) {
                await discordService.updateNftHolderRoles(userId, ownedNftSeries);

                const embed = getNftOwnerEmbed();
                await discordService.notifyUserInDiscord(userId, threadId, embed);
            } else {
                const embed = getNonNftOwnerEmbed();
                await discordService.notifyUserInDiscord(userId, threadId, embed);
            }
        }
    } catch (error) {
        logger.error(error);
    }
};

async function isRepeatedVerificationAttempt(walletVerifiedMessage: WalletVerification) {
    const userId = walletVerifiedMessage.UserId;
    const threadId = walletVerifiedMessage.ThreadId;

    logger.info(`Checking if user ${userId} is already verified`);
    const discordVerification = await walletService.getWalletByUser(userId);

    logger.debug('Get wallet by user response: ', discordVerification);

    if (discordVerification != null) {
        logger.warn(
            `User ${discordVerification.UserId} already connected a wallet: ${discordVerification.WalletAddress}`,
        );

        const embed = getAccountAlreadyConnectedEmbed();

        await discordService.notifyUserInDiscord(userId, threadId, embed);

        return true;
    }

    logger.info(`User ${userId} hasn't verified yet`);
    return false;
}

function getAccountAlreadyConnectedEmbed() {
    return new EmbedBuilder()
        .setTitle('Failed to link Account!')
        .setDescription(`There is already a wallet linked with this Discord account.\n\n`)
        .addFields({
            name: `IMPORTANT`,
            value: `At the moment is not possible to change the account linked to this Discord. If you need assistance, please contact us at ${botConfig.SUPPORT_EMAIL} and we'll try to help.\n`,
        })
        .setColor(colors.Error)
        .setTimestamp();
}

const title = 'Account Linked Successfully!';
const description = 'Your wallet is now linked to your Discord account.\n\n';

function getNftOwnerEmbed() {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .addFields({
            name: `NFT Ownership Verified`,
            //TODO: might need to change based on decision about NFT metadata
            value: `You are an NFT holder and we have assigned you the corresponding roles based on your NFT's series.`,
            inline: true,
        })
        .setColor(colors.Success)
        .setTimestamp();
}

function getNonNftOwnerEmbed() {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .addFields(
            {
                name: 'Unable to verify NFT Ownership',
                value: `You don't seem to own an NFT yet. If you wish to obtain one, head over to ${botConfig.NFT_MARKETPLACE} `,
                inline: true,
            },
            {
                name: '\u200B',
                value: `When you get an NFT we will automatically assign you the appropriate role.\n`,
                inline: false,
            },
            {
                name: '\u200B',
                value: `If you think there has been an issue with verifying your NFT ownership, please contact us at ${botConfig.SUPPORT_EMAIL}`,
                inline: false,
            },
        )
        .setColor(colors.Warning)
        .setTimestamp();
}
