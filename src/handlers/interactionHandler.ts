import { Client, Interaction } from 'discord.js';

export async function handleInteraction(client: Client, interaction: Interaction): Promise<void> {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            await interaction.reply({
                content: 'Command not found!',
                ephemeral: true,
            });
            return;
        }

        try {
            await command.execute(client, interaction);
            console.log(`✅ ${interaction.user.tag} executed /${interaction.commandName}`);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);

            const errorMessage = 'There was an error while executing this command!';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: errorMessage,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true,
                });
            }
        }
    }
}