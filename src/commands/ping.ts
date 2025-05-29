import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';

export const pingCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and bot latency!')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true,
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        await interaction.editReply({
            content: `🏓 Pong!\n📡 Latency: ${latency}ms\n💓 API Latency: ${apiLatency}ms`,
        });
    },
};