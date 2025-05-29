import { Client, Interaction, Message } from 'discord.js';

export async function handleMessage(message: Message): Promise<void> {
    // Handle slash commands
    if (message.author.bot) return;
    const guild = message.guild;
    if (!guild) {
        await message.reply({
            content: 'This command can only be used in a server!',
        });
        return;
    }

    // Handle messages
    if (message.guild && message.channel.isTextBased()) {
        const channelName = 'name' in message.channel ? message.channel.name : 'DM/Private Channel';
        console.log(`[${message.guild.name}] #${channelName}: ${message.author.tag}: ${message.content}`)

        // Example: simple reply if someone says "hello"
        if (message.content.toLowerCase().includes('hello')) {
            message.reply('Hi there! 👋')
        }
    }
}