import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { config } from 'dotenv';
import { Command } from './types/Command';
import { loadCommands } from './utils/commandLoader';
import { handleInteraction } from './handlers/interactionHandler';
import { handleMessage } from './handlers/messageHandler';

// Load environment variables
config();

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Add commands collection to client
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
    }
}

client.commands = new Collection<string, Command>();

// Event: Bot is ready
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`✅ Bot is online! Logged in as ${readyClient.user.tag}`);

    // Load commands
    await loadCommands(client);
    console.log(`📚 Loaded ${client.commands.size} commands`);
});

// Event: Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
    await handleInteraction(client, interaction);
});

client.on(Events.MessageCreate, async (message) => {
    await handleMessage(message);
});

// Event: Handle errors
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

// Event: Handle warnings
client.on('warn', (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});