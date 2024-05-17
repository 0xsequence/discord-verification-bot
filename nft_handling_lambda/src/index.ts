import {EmbedBuilder} from 'discord.js';
import {EventBridgeEvent, Handler} from 'aws-lambda';

import {Detail} from './types/detail';
import {Data} from './types/data';
import {globalLogger as logger} from './types/global_logger';
import {colors} from './types/color';
import {botConfig} from './types/bot_config';

import {DiscordService} from '@0xsequence/discord-utils';
import {Nft, Wallet, WalletService} from '@0xsequence/wallet-utils';

import {setupDiscordService} from './setup/setup_discord_service';
import {setupWalletService} from './setup/setup-wallet-service';
import {isNullOrUndefined} from '@0xsequence/shared-utils';

// TODO IMPROVEMENT: move these to a lambda layer
const discordService: DiscordService = setupDiscordService();
const walletService: WalletService = setupWalletService();

// AWS Lambda's Node runtime does not support typescript yet,
// //you have to transpile your code before deploying.
// TODO CI: Make sure you have correct tsconfig and do npm (or yarn) build before you deploy the lambda
export const handler: Handler<EventBridgeEvent<string, Detail>> = async (
    event: EventBridgeEvent<string, Detail>,
): Promise<void> => {
    // TODO @Taylan: do we need to change source of the event? Currently put a dummy value: 0xsequence.blockchain
    logger.info('Received event: ', event);

    const eventDetailData = event.detail.Data;
    if (!eventDetailData) {
        return;
    }

    const detailType = event['detail-type'];
    switch (detailType) {
        case 'NftMinted':
            await handleNftMinted(eventDetailData.Nft);
            break;

        case 'NftTransferred':
            await handleNftTransferred(eventDetailData);
            break;

        default: {
            const error = new Error(`${detailType} handling not implemented`);
            logger.error(error);
            throw error;
        }
    }
};

async function handleNftMinted(mintedNft: Nft): Promise<void> {
    try {
        const nftWallet: string = mintedNft.Wallet;
        const saveNftToWalletResult = await walletService.saveNftToWallet(nftWallet, mintedNft);

        // Skip all discord related actions when the wallet has not been connected to Discord
        if (isNullOrUndefined(saveNftToWalletResult?.UserId)) {
            logger.info(`Skipping all Discord actions as no Discord user has claimed the wallet ${nftWallet} yet`);
            return;
        }

        const userId = saveNftToWalletResult?.UserId;
        const ownedNftSeries = saveNftToWalletResult?.Nfts.map((nft) => nft.NftSeries);
        const uniqueNftSeries = [...new Set(ownedNftSeries)];

        console.log('Unique NFTs owned Series: ', uniqueNftSeries);

        await discordService.updateNftHolderRoles(userId!, uniqueNftSeries);

        const threadId = saveNftToWalletResult?.ThreadId;
        const embed: EmbedBuilder = getNewHolderEmbed();

        await discordService.notifyUserInDiscord(userId!, threadId!, embed);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function handleNftTransferred(nftTransferredEventDetailData: Data): Promise<void> {
    try {
        const fromWallet = nftTransferredEventDetailData.FromWallet;
        const transferredNft = nftTransferredEventDetailData.Nft;

        if (transferredNft.Wallet === fromWallet) {
            logger.info(
                `Skipping transfer NFT. Destination wallet is the same as origin wallet. From: ${fromWallet} - To: ${transferredNft.Wallet}`,
            );
            return;
        }

        await removeNftFromPreviousHolder(fromWallet!, transferredNft);

        await transferNftToNewHolder(transferredNft);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function removeNftFromPreviousHolder(fromWallet: string, transferredNft: Nft): Promise<void> {
    logger.info('Removing NFT from previous holder');
    const previousHolderData = await walletService.getWalletByAdress(fromWallet);

    if (previousHolderData) {
        logger.info('Previous NFT holder wallet found:');

        // TODO: change in wallet service to receive a wallet or wallet address, as needed
        const removeNftFromPreviousHolderResult = await walletService.removeNftFromWallet(
            previousHolderData,
            transferredNft,
        );

        if (removeNftFromPreviousHolderResult?.UserId !== undefined) {
            await handleDiscordVerifiedUser(removeNftFromPreviousHolderResult, true);
        }
    } else {
        logger.warn('Previous NFT holder wallet not found. Skipping NFT removal process from previous holder');
    }
}

async function transferNftToNewHolder(transferredNft: Nft): Promise<void> {
    logger.info('Transferring NFT to new holder');

    const transferToNewHolderResult = await walletService.saveNftToWallet(transferredNft.Wallet, transferredNft);

    if (transferToNewHolderResult?.UserId !== undefined) {
        await handleDiscordVerifiedUser(transferToNewHolderResult!, false);
    }
}

async function handleDiscordVerifiedUser(nftTransferResult: Wallet, isPreviousHolder: boolean): Promise<void> {
    logger.info('handleDiscordVerifiedUser - isPreviousHolder: ', isPreviousHolder);

    try {
        // TODO @Taylan: this need to return whatever we call the NFT metadata property. Using Series for now.
        const nftHolderHighestNftTier: string[] = ['Test2']; //walletService.getWalletHighestNftTier(nftTransferResult);
        const userId = nftTransferResult.UserId;

        await discordService.updateNftHolderRoles(userId!, nftHolderHighestNftTier);

        const threadId = nftTransferResult.ThreadId;
        const embed = isPreviousHolder ? getPreviousHolderEmbed() : getNewHolderEmbed();

        await discordService.notifyUserInDiscord(userId!, threadId!, embed);
    } catch (error) {
        // Should not throw exceptions, as the DB steps might be completed, and we don't want to replay the event.
        // In case this fails, we need to fix the discord state (roles/communication with user) manually
        logger.error(error);
    }
}

const titleDefault: string = 'NFT Ownership Updated';
const field1DefaultName: string = 'IMPORTANT';
const field1DefaultValue: string = `Your roles in this server might have been updated to reflect the changes in your NFT ownership`;
const field2DefaultValue: string = `If you think there is an error, please contact us at ${botConfig.SUPPORT_EMAIL}`;

function getPreviousHolderEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(botConfig.OWNERSHIP_UPDATED_TITLE ?? titleDefault)
        .setDescription(botConfig.PREVIOUS_HOLDER_DESCRIPTION ?? 'We noticed you transferred an NFT!\n\n')
        .addFields(
            {
                name: botConfig.FIELD1_NAME ?? field1DefaultName,
                value: botConfig.FIELD1_VALUE ?? field1DefaultValue,
                inline: true,
            },
            {
                name: '\u200B',
                value: botConfig.FIELD2_VALUE ?? field2DefaultValue,
                inline: false,
            },
        )
        .setColor(colors.Yellow)
        .setTimestamp();
}

function getNewHolderEmbed(): EmbedBuilder {
    return (
        new EmbedBuilder()
            .setTitle(botConfig.OWNERSHIP_UPDATED_TITLE ?? titleDefault)
            .setDescription(botConfig.NEW_HOLDER_DESCRIPTION ?? 'Congratulations on obtaining an NFT!\n\n')
            .addFields(
                {
                    name: botConfig.FIELD1_NAME ?? field1DefaultName,
                    value: botConfig.FIELD1_VALUE ?? field1DefaultValue,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: botConfig.FIELD2_VALUE ?? field2DefaultValue,
                    inline: false,
                },
            )
            //.setColor(colors.Green)
            .setTimestamp()
    );
}
