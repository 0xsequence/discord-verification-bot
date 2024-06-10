import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, User } from 'discord.js';
import jwt from 'jsonwebtoken';
import { colors } from '../types/colors';
import { botConfig } from '../types/bot_config';
import { Wallet } from '@0xsequence/discord-bot-wallet-utils';

export { EmbedGenerationService };

class EmbedGenerationService {
    public getVerificationMessage(): EmbedBuilder {
        const description =
            'Are you a new NFT holder or do you need to manage your linked wallet?\n\nYou can link your wallet to Discord to verify ownership of an NFT and get your exclusive role and all the unique perks attached to it!';

        return new EmbedBuilder()
            .setTitle('Wallet Management & NFT Ownership Verification')
            .setDescription(description)
            .setFields([
                {
                    name: 'IMPORTANT',
                    value: `Never share your wallet details with anyone but this bot. Our staff will never ask for your details here or via DM.\\nFor any support questions, always use ${botConfig.SUPPORT_EMAIL}\\n\\n`,
                    inline: true,
                },
            ])
            .setColor(colors.Info)
            .setImage(botConfig.PUBLIC_EMBED_IMAGE_URL);
    }

    public createManagementEmbed() {
        return new EmbedBuilder()
            .setTitle('Wallet Management')
            .setDescription('Your Discord is already linked to a wallet.\nYou can only have one wallet linked to your Discord account at a time.')
            .addFields({
                name: 'IMPORTANT',
                value: `At the moment is not possible to change the wallet linked to this Discord account. If you need assistance, please contact ${botConfig.SUPPORT_EMAIL} and we'll try to help.\n`,
            })
            .setColor(colors.Info)
            .setTimestamp();
    }

    public createVerificationEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('Wallet Verification')
            .setDescription(
                `Unlock your full potential!.\n\nClicking on the button below will take you to ${botConfig.VERIFICATION_PAGE_URL} where you can login with your wallet and link it with Discord.`,
            )
            .addFields({
                name: 'IMPORTANT',
                value: 'To properly verify ownership, use the same login you used when purchasing your NFT!',
            })
            .setColor(colors.Info)
            .setTimestamp();
    }

    public addManagementButtons(): ActionRowBuilder<ButtonBuilder> {
        const checkLinkedAccountButton = new ButtonBuilder().setLabel('Check Linked Wallet').setCustomId('check_linked_account_btn').setStyle(ButtonStyle.Primary);
        //TODO - Unlink Account button

        return new ActionRowBuilder<ButtonBuilder>().addComponents(checkLinkedAccountButton);
    }

    public async addVerifyButton(user: User, threadChannelId: string): Promise<ActionRowBuilder<ButtonBuilder>> {
        const token = await this.createVerificationToken(user, threadChannelId);

        const verificationPage = botConfig.VERIFICATION_PAGE_URL;

        // TODO: url shortener
        const verifyButton = new ButtonBuilder().setLabel('Verify your wallet').setURL(`${verificationPage}?token=${token}`).setStyle(ButtonStyle.Link);

        return new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);
    }

    public buildWalletFoundEmbed(wallet: Wallet) {
        return new EmbedBuilder()
            .setTitle('Linked Wallet')
            .setDescription(`Your Discord is linked to the following account:\n ${wallet.Email}\n ${wallet.WalletAddress}\n`)
            .addFields({
                name: `WARNING`,
                value: `Never share your details with anyone but this bot. Our staff will never ask for your details here or via DM.\nFor any support questions, always use our support email: ${botConfig.SUPPORT_EMAIL}`,
                inline: true,
            })
            .setColor(colors.Success)
            .setTimestamp();
    }

    public buildWalletNotFoundEmbed() {
        return new EmbedBuilder()
            .setTitle('No wallet linked')
            .setDescription(`We were unable to find any wallet linked with your Discord account.`)
            .addFields({
                name: `TROUBLESHOOTING`,
                value: `(*) Make sure you are logged in to Discord with the right user/account.\n\n(*) Head to the verification channel and click the Get Started button to start linking your wallet and verify ownership of an NFT.\n\n(*) If you require assistance, please contact us to ${botConfig.SUPPORT_EMAIL} and we'll try to help.`,
                inline: true,
            })
            .setColor(colors.Error)
            .setTimestamp();
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
