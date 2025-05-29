import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { pingCommand } from './commands/ping';
import { userInfoCommand } from './commands/userinfo';
import { serverInfoCommand } from './commands/serverinfo';

// Load environment variables
config();

const commands = [
    pingCommand.data.toJSON(),
    userInfoCommand.data.toJSON(),
    serverInfoCommand.data.toJSON(),
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

async function deployCommands() {
    try {
        console.log('🔄 Started refreshing application (/) commands.');

        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for development)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('✅ Successfully reloaded application (/) commands for guild.');
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID!),
                { body: commands }
            );
            console.log('✅ Successfully reloaded application (/) commands globally.');
        }
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}

deployCommands();