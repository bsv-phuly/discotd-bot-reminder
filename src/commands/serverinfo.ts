import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';

export const serverInfoCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply({
                content: 'This command can only be used in a server!',
                ephemeral: true,
            });
            return;
        }

        const owner = await guild.fetchOwner();
        const channels = guild.channels.cache;
        const textChannels = channels.filter(channel => channel.type === 0).size;
        const voiceChannels = channels.filter(channel => channel.type === 2).size;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`${guild.name} Server Information`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 Owner', value: owner.user.tag, inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
                { name: '💬 Text Channels', value: textChannels.toString(), inline: true },
                { name: '🔊 Voice Channels', value: voiceChannels.toString(), inline: true },
                { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        if (guild.description) {
            embed.setDescription(guild.description);
        }

        await interaction.reply({ embeds: [embed] });
    },
};