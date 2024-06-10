import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { VerifyWalletHandler } from './EventHandling/verify_wallet';
import { CheckWalletHandler } from './EventHandling/check_wallet';
import { botConfig } from './types/bot_config';
import { EmbedGenerationService } from './services/embed_generation_service';
import { globalLogger as logger } from './types/global_logger';

const embedGenerationService = new EmbedGenerationService();

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

async function main() {
    try {
        await client.login(botConfig.BOT_TOKEN);
    } catch (error) {
        logger.error(error);
    }
}

// TODO: [esbuild Error]: Top-level await is currently not supported with the "cjs" output format
//await main();
main();

client.on(Events.ClientReady, (client) => {
    logger.info(`${client.user.tag} - Is online!`);
});

client.once(Events.ClientReady, async () => {
    logger.info(`Loading application commands...`);
    await showVerifyWalletMessage();
    await registerCommands(client);
    logger.info(`Successfully loaded application commands...`);
});

async function registerCommands(client: Client) {
    await VerifyWalletHandler.HandleVerifyWalletCommand(client);
    await CheckWalletHandler.HandleCheckWalletCommand(client);
}

async function showVerifyWalletMessage() {
    logger.info(`Sending verify wallet message to verification channel`, botConfig.VERIFICATION_CHANNEL_ID);

    if (botConfig.VERIFICATION_CHANNEL_ID) {
        const verificationChannel = (await client.channels.fetch(botConfig.VERIFICATION_CHANNEL_ID)) as TextChannel;

        if (verificationChannel != null) {
            await sendPublicEmbedToVerificationChannel(verificationChannel);
        }
    }
}

async function sendPublicEmbedToVerificationChannel(currentChannel: TextChannel | null) {
    if (currentChannel == null) {
        logger.error(`Failed to send embed to Verification channel. Current Channel:`, currentChannel);
        return;
    }

    // check no earlier messages exist in the verify channel
    const channelMessages = await currentChannel.messages.fetch();
    logger.debug(`Verification channel messages: ${channelMessages.size}`);

    if (channelMessages.size === 0) {
        logger.info(`Posting Ownership Verification embed to the channel`);

        const embed = embedGenerationService.getVerificationMessage();

        await currentChannel.send({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            style: 1,
                            type: 2,
                            disabled: false,
                            label: 'Get started!',
                            custom_id: 'account_management_btn',
                        },
                    ],
                },
            ],
        });
        return;
    }

    logger.info('The verification channel already contains a message. Please delete it and re-start the bot if you need to post a new message!');
}
