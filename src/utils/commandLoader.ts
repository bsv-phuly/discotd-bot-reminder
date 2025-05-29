import { Client } from 'discord.js';
import { Command } from '../types/Command';
import { pingCommand } from '../commands/ping';
import { userInfoCommand } from '../commands/userinfo';
import { serverInfoCommand } from '../commands/serverinfo';

export async function loadCommands(client: Client): Promise<void> {
    const commands: Command[] = [
        pingCommand,
        userInfoCommand,
        serverInfoCommand,
    ];

    // Add commands to client collection
    for (const command of commands) {
        client.commands.set(command.data.name, command);
    }
}