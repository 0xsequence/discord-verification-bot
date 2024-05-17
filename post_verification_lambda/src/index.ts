import {SNSEvent, SNSHandler} from 'aws-lambda';
import {EmbedBuilder} from 'discord.js';

import {colors} from './types/color';
import {botConfig} from './types/bot_config';
import {globalLogger as logger} from './types/global_logger';

import {setupDiscordService} from './setup/setup_discord_service';
import {setupWalletService} from './setup/setup-wallet-service';

import {Wallet, WalletService, WalletVerification} from '@0xsequence/wallet-utils';
import {DiscordService} from '@0xsequence/discord-utils';

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

        if (userAlreadyVerified) {
            logger.warn(`Ignoring repeated attempt to verify by Discord user ${walletVerifiedMessage.UserId}`);
            return;
        }

        const wallet = await walletService.saveDiscordWalletVerification(walletVerifiedMessage);
        logger.debug(wallet);

        if (wallet) {
            await discordService.assignAccountVerifiedRole(walletVerifiedMessage.UserId);

            const isNFTHolder = checkWalletHasNfts(wallet);

            if (isNFTHolder) {
                await discordService.updateRole(walletVerifiedMessage.UserId, ''); // TODO: fix, see nft-handling-lambda

                const embed = getSuccessNftOwnerEmbed(''); // TODO: fix
                await discordService.notifyUserInDiscord(wallet.UserId ?? '', wallet.ThreadId ?? '', embed); // TODO: fix
            } else {
                const embed = getSuccessEmbed();
                const userId = walletVerifiedMessage.UserId;
                const threadId = walletVerifiedMessage.ThreadId;

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
        .setTitle(botConfig.ACCOUNT_ALREADY_LINKED_TITLE ?? 'Failed to link Account!')
        .setDescription(
            botConfig.ACCOUNT_ALREADY_LINKED_DESCRIPTION ?? `There is already an account linked with this Discord.\n`,
        )
        .addFields({
            name: `IMPORTANT`,
            value: `At the moment is not possible to change the account linked to this Discord. If you need assistance, please contact us at ${botConfig.SUPPORT_EMAIL} and we'll try to help.\n`,
        })
        .setColor(colors.Red)
        .setTimestamp();
}

function checkWalletHasNfts(wallet: Wallet | undefined) {
    const isNFTHolder = wallet?.Nfts !== undefined && wallet.Nfts.length > 0;

    logger.debug(`isNFTHolder: ${isNFTHolder}`);

    return isNFTHolder;
}

function getSuccessNftOwnerEmbed(nftHolderHighestNftTier: string) {
    const roleName = getRoleNameForNftTier(nftHolderHighestNftTier);

    return new EmbedBuilder()
        .setTitle(botConfig.ACCOUNT_LINKED_SUCCESS_TITLE ?? 'Account Linked Successfully!')
        .setDescription(botConfig.ACCOUNT_LINKED_SUCCESS_DESCRIPTION ?? 'Your account is now linked to your Discord.\n')
        .addFields({
            name: botConfig.ACCOUNT_LINKED_SUCCESS_OWNER_FIELD_NAME ?? `NFT Ownership Verified`,
            value: `We found an ${nftHolderHighestNftTier} and we have assigned you the corresponding ${roleName} role.`,
            inline: true,
        })
        .setColor(colors.Green)
        .setTimestamp();
}

// TODO: change by nft/role mapping (NFT_ROLES)
function getRoleNameForNftTier(nftHolderHighestNftTier: string) {
    return 'Dummy'
}

function getSuccessEmbed() {
    return new EmbedBuilder()
        .setTitle(botConfig.ACCOUNT_LINKED_SUCCESS_TITLE ?? 'Account Linked Successfully!')
        .setDescription(botConfig.ACCOUNT_LINKED_SUCCESS_DESCRIPTION ?? 'Your account is now linked to your Discord.\n')
        .addFields(
            {
                name: 'Unable to verify NFT Ownership',
                value:
                    botConfig.ACCOUNT_LINKED_SUCCESS_NON_OWNER_FIELD1_VALUE ??
                    `You don't seem to own an NFT yet. If you wish to obtain one, head over to ${botConfig.NFT_MARKETPLACE} `,
                inline: true,
            },
            {
                name: '\u200B',
                value:
                    botConfig.ACCOUNT_LINKED_SUCCESS_NON_OWNER_FIELD2_VALUE ??
                    `When you get an NFT we will automatically assign you the appropriate role. \n`,
                inline: false,
            },
            {
                name: '\u200B',
                value: `If you think there has been an issue with verifying your NFT ownership, please contact us at ${botConfig.SUPPORT_EMAIL}`,
                inline: false,
            },
        )
        .setColor(colors.Yellow)
        .setTimestamp();
}
