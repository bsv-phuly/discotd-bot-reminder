import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';

export const userInfoCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        // .addUserOption(option =>
        //     option
        //         .setName('user')
        //         .setDescription('The user to get information about')
        //         .setRequired(false)
        // ),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(targetUser.id);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`User Information`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '👤 Username', value: targetUser.tag, inline: true },
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        if (member) {
            embed.addFields(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`, inline: false },
                { name: '🎭 Roles', value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'No roles', inline: false }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};