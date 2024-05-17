import {Client, EmbedBuilder, Events, Interaction} from 'discord.js';
import {colors} from '../types/colors';
import {globalLogger as logger} from '../types/global_logger';
import {setupWalletService} from '../services/setup-wallet-service';
import {botConfig} from '../types/bot_config';

const HandleCheckWalletCommand = async (client: Client): Promise<void> => {
    const walletService = setupWalletService();
    client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
        if (!interaction.isButton() || interaction.customId !== 'check_linked_account_btn') {
            return;
        }

        logger.debug(interaction);

        // TODO IMPROVEMENT: this should use the wallet-management-lambda, not the wallet service directly.
        try {
            const userId = interaction.user.id;
            logger.info(`Checking connected wallet for Discord user ${userId}`);

            // TODO @Taylan: Originally this was the email as LP didn't want to mention WALLETS.
            // What do you prefer to show here? We could also show both wallet address and email as improvement
            const wallet = await walletService.getWalletByUser(userId);

            const connectedAccountEmail = wallet?.Email;

            let checkWalletResponseEmbed;
            if (connectedAccountEmail != null) {
                checkWalletResponseEmbed = buildWalletFoundEmbed(connectedAccountEmail);
            } else {
                checkWalletResponseEmbed = buildWalletNotFoundEmbed();
            }

            if (interaction.channel) {
                await interaction.channel.send({ embeds: [checkWalletResponseEmbed] });
            }
        } catch (error) {
            logger.error(error);
        }
    });
};

export const CheckWalletHandler = {
    HandleCheckWalletCommand: HandleCheckWalletCommand,
};

function buildWalletFoundEmbed(connectedAccountEmail: string) {
    return new EmbedBuilder()
        .setTitle('Linked Wallet')
        .setDescription(botConfig.WALLET_FOUND_DESCRIPTION ?? `Your Discord is linked to the following wallet:\n ${connectedAccountEmail}`)
        .addFields({
            name: botConfig.WALLET_FOUND_FIELD_NAME ?? `WARNING`,
            value:
                botConfig.WALLET_FOUND_FIELD_VALUE ??
                `Never share your details with anyone but this bot. Our staff will never ask for your details here or via DM.\nFor any support questions, always use our support email: ${botConfig.SUPPORT_EMAIL}`,
            inline: true,
        })
        .setColor(colors.Green)
        .setTimestamp();
}

function buildWalletNotFoundEmbed() {
    return new EmbedBuilder()
        .setTitle('No wallet linked')
        .setDescription(botConfig.WALLET_NOT_FOUND_DESCRIPTION ?? `We were unable to find any wallet linked with your Discord.`)
        .addFields({
            name: botConfig.WALLET_NOT_FOUND_FIELD_NAME ?? `TROUBLESHOOTING`,
            value:
                botConfig.WALLET_NOT_FOUND_FIELD_VALUE ??
                `(*) Make sure you are logged in to Discord with the right user/account.\n\n(*) Head to the verification channel and click the Get Started button to start linking your wallet and verify ownership of an NFT.\n\n(*) If you require assistance, please contact us to ${botConfig.SUPPORT_EMAIL} and we'll try to help.`,
            inline: true,
        })
        .setColor(colors.Red)
        .setTimestamp();
}

//TODO IMPROVEMENT - See wallet-management-lambda
/*async function publishWalletCheckRequestToSns(userId, managementThreadId) {
    const topicARN = process.env.TOPIC_ARN;
    const message = {
        user_id: userId,
        thread_id: managementThreadId,
    };

    const params = {
        Message: JSON.stringify(message),
        TopicArn: topicARN,
    };

    const publishCommand = new PublishCommand(params);

    try {
        const data = await snsClient.send(publishCommand);
        console.log('Success!', data);
    } catch (err) {
        console.log(`Error sending message to SNS topic: ${topicARN} - `, err);
    }
}*/
