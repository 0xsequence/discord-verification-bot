import { Client, Events, Interaction } from 'discord.js';
import { globalLogger as logger } from '../types/global_logger';
import { setupWalletService } from '../services/setup_wallet_service';
import { EmbedGenerationService } from '../services/embed_generation_service';

const embedGenerationService = new EmbedGenerationService();

const HandleCheckWalletCommand = async (client: Client): Promise<void> => {
    const walletService = setupWalletService();
    client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
        if (!interaction.isButton() || interaction.customId !== 'check_linked_account_btn') {
            return;
        }

        logger.debug(interaction);
        await interaction.deferUpdate();

        // TODO IMPROVEMENT: this should use the wallet-management-lambda, not the wallet service directly.
        try {
            const userId = interaction.user.id;
            logger.info(`Checking connected wallet for Discord user ${userId}`);

            const wallet = await walletService.getWalletByUser(userId);

            const connectedAccountEmail = wallet?.Email;

            let checkWalletResponseEmbed;
            if (wallet && connectedAccountEmail != null) {
                checkWalletResponseEmbed = embedGenerationService.buildWalletFoundEmbed(wallet);
            } else {
                checkWalletResponseEmbed = embedGenerationService.buildWalletNotFoundEmbed();
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
