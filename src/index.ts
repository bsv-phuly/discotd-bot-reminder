import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { Command } from './types/Command';
import { loadCommands } from './utils/commandLoader';
import { handleInteraction } from './handlers/interactionHandler';
import { handleMessage } from './handlers/messageHandler';
import { Database } from './database/db';
import { config } from './config';
import { logger } from './utils/logger';

// Initialize database
const database = new Database();

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
    logger.info(`✅ Bot is online! Logged in as ${readyClient.user.tag}`);

    // Connect to database
    try {
        await database.connect();
        logger.info('📊 Database connected successfully');
    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }

    // Load commands
    await loadCommands(client);
    logger.info(`📚 Loaded ${client.commands.size} commands`);
});

// Event: Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
    await handleInteraction(client, interaction);
});

// Event: Handle messages
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

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('🔄 Shutting down gracefully...');
    await database.close();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('🔄 Shutting down gracefully...');
    await database.close();
    client.destroy();
    process.exit(0);
});

// Login to Discord
client.login(config.discord.token).catch((error) => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});