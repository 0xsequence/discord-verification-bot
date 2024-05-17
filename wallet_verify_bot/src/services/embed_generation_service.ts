import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, User} from 'discord.js';
import jwt from 'jsonwebtoken';
import {colors} from '../types/colors';
import {botConfig} from '../types/bot_config';

export { EmbedGenerationService };

class EmbedGenerationService {
    public createManagementEmbed() {
        return new EmbedBuilder()
            .setTitle(botConfig.WALLET_MANAGEMENT_TITLE ?? 'Wallet Management')
            .setDescription(botConfig.WALLET_MANAGEMENT_DESCRIPTION ?? 'Your Discord is already linked to a wallet.\nYou can only have one wallet linked to your Discord account at a time.')
            .addFields({
                name: botConfig.WALLET_MANAGEMENT_FIELD_NAME ?? 'IMPORTANT',
                value:
                    botConfig.WALLET_MANAGEMENT_FIELD_VALUE ??
                    `At the moment is not possible to change the wallet linked to this Discord account. If you need assistance, please contact ${botConfig.SUPPORT_EMAIL} and we'll try to help.\n`,
            })
            .setColor(colors.Blue)
            .setTimestamp();
    }

    public createVerificationEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(botConfig.VERIFICATION_TITLE ?? 'Wallet Verification')
            .setDescription(
                botConfig.VERIFICATION_DESCRIPTION ??
                    `Unlock your full potential!.\n\nClicking on the button below will take you to ${botConfig.VERIFICATION_PAGE_URL} where you can login with your wallet and link it with Discord.`,
            )
            .addFields({
                name: botConfig.VERIFICATION_FIELD_NAME ?? 'IMPORTANT',
                value: botConfig.VERIFICATION_FIELD_VALUE ?? 'To properly verify ownership, use the same login you used when purchasing your NFT!',
            })
            .setColor(colors.Blue)
            .setTimestamp();
    }

    public addManagementButtons(): ActionRowBuilder<ButtonBuilder> {
        const checkLinkedAccountButton = new ButtonBuilder().setLabel('Check Linked Wallet').setCustomId('check_linked_account_btn').setStyle(ButtonStyle.Primary);
        //TODO - Unlink Account button

        return new ActionRowBuilder<ButtonBuilder>().addComponents(checkLinkedAccountButton);
    }

    public async addVerifyButton(user: User, threadChannelId: string): Promise<ActionRowBuilder<ButtonBuilder>> {
        const token = await this.createVerificationToken(user, threadChannelId);

        const verificationPage = process.env.VERIFICATION_PAGE_URL;

        // TODO: url shortener
        const verifyButton = new ButtonBuilder().setLabel('Verify your wallet').setURL(`${verificationPage}?token=${token}`).setStyle(ButtonStyle.Link);

        return new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);
    }

    /*
     * @param threadId ID of the thread created for the user when they clicked Verify button in the verification channel's message
     * @param user Discord User
     * @see https://www.npmjs.com/package/jsonwebtoken */
    private async createVerificationToken(user: User, threadId: string): Promise<string> {
        const payload = {
            user_id: user.id,
            username: user.username,
            thread_id: threadId,
        };

        if (botConfig.JWT_SECRET != null) {
            return jwt.sign(payload, botConfig.JWT_SECRET, {
                algorithm: 'HS256',
                expiresIn: '900s',
                issuer: botConfig.ISSUER,
            });
        }

        throw new Error(`Failed to generate token. Check that the bot configuration contains a valid JWT_SECRET value`);
    }
}
