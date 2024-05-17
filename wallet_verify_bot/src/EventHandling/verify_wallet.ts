import { ButtonInteraction, ChannelType, Client, Events, GuildMember, GuildMemberRoleManager, Role, TextChannel } from 'discord.js';
import { EmbedGenerationService } from '../services/embed_generation_service';
import { globalLogger as logger } from '../types/global_logger';
import { botConfig } from '../types/bot_config';

const embedGenerationService = new EmbedGenerationService();

const HandleVerifyWalletCommand = async (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction): Promise<void> => {
        if (interaction == null) {
            return;
        }

        if (!interaction.isButton() || interaction.customId !== 'account_management_btn') {
            return;
        }

        await interaction.deferUpdate();
        // TODO: fix interaction.deferUpdate() SOMETIMES THROWS Unhandled 'error' event

        logger.debug(interaction);

        const guildMember = interaction.member as GuildMember;
        const userHasAccountVerified = userHasWalletVerifiedRole(guildMember.roles);
        logger.info(`User has wallet verified role: ${userHasAccountVerified}`);

        if (userHasAccountVerified) {
            await openWalletManagementThread(interaction);
            return;
        }

        await openWalletVerificationThread(interaction);
    });
};

export const VerifyWalletHandler = {
    HandleVerifyWalletCommand: HandleVerifyWalletCommand,
};

function userHasWalletVerifiedRole(memberRoles?: GuildMemberRoleManager): boolean {
    const verifiedRoleId = botConfig.WALLET_VERIFIED_ROLE_ID;

    const accountVerifiedRole = memberRoles?.cache.find((role: Role) => role.id === verifiedRoleId);

    return accountVerifiedRole != null;
}

async function openWalletManagementThread(interaction: ButtonInteraction) {
    try {
        const userName = interaction.user.username.toUpperCase();
        const threadName = `${userName}'s Linked Wallet Management`;
        const reason = 'User wants to manage their linked wallet';

        const threadChannel = await createPrivateThreadForUser(interaction, threadName, reason);

        const embed = embedGenerationService.createManagementEmbed();
        const buttons = embedGenerationService.addManagementButtons();

        await threadChannel.send({
            embeds: [embed],
            components: [buttons],
            options: { ephemeral: true },
        });
    } catch (error) {
        logger.error(error);
    }
}

async function openWalletVerificationThread(interaction: ButtonInteraction) {
    try {
        const user = interaction.user;
        const userName = user.username.toUpperCase();
        const threadName = `${userName}'s NFT Ownership Verification`;
        const reason = 'User started wallet verification';

        const threadChannel = await createPrivateThreadForUser(interaction, threadName, reason);

        const embed = embedGenerationService.createVerificationEmbed();
        const button = await embedGenerationService.addVerifyButton(user, threadChannel.id);

        await threadChannel.send({
            embeds: [embed],
            components: [button],
            options: { ephemeral: true },
        });
    } catch (error) {
        logger.error(error);
    }
}

async function createPrivateThreadForUser(interaction: ButtonInteraction, threadName: string, reason: string) {
    const channel = interaction.channel as TextChannel;

    const autoArchiveAfterMinutes = 60; // TODO IMPROVEMENT: Add to env vars as config

    const threadChannel = await channel.threads.create({
        name: threadName,
        type: ChannelType.PrivateThread,
        reason: reason,
        autoArchiveDuration: autoArchiveAfterMinutes,
    });

    await threadChannel.members.add(interaction.user);
    return threadChannel;
}
