import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';
import { GoogleGenAI } from "@google/genai";
import { config } from '../config';
import { logger } from '../utils/logger';
import { ChatHistoryRepository } from '../database/repository';
import { ChatHistory } from '../models/chatHistory';

// Initialize the Google Generative AI client
const modelName = 'gemini-2.5-flash-preview-04-17';
const ai = new GoogleGenAI({ 
    apiKey: config.ai.gemini_key || '' 
});

function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, (char) => '\\' + char);
}

function formatMarkdownWithCode(text: string): string {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let result = '';
    let lastIndex = 0;

    // Iterate over all code blocks
    for (const match of text.matchAll(codeBlockRegex)) {
        const [fullMatch, codeContent] = match;
        const index = match.index ?? 0;

        // Escape and append text before the code block
        const beforeCode = text.slice(lastIndex, index);
        result += escapeMarkdown(beforeCode);

        // Append the raw (already in triple-backtick format) code block
        result += `\n\`\`\`\n${escapeMarkdown(codeContent)}\n\`\`\``;

        lastIndex = index + fullMatch.length;
    }

    // Escape and append remaining text after last code block
    result += escapeMarkdown(text.slice(lastIndex));

    return result;
}

async function saveChatHistory(userId: string, message: any, username?: string, guildId?: string) {
    try {
        const chatHisotry = new ChatHistoryRepository();
        await chatHisotry.saveChatHistory(userId, message, username, guildId);
    } catch (error) {
        logger.error('Error saving chat history:', error);
    }
}

export const chatCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chat with AI (Gemini) - Ask questions or have conversations')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('Your message or question for the AI')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const role = interaction.user.bot ? 'bot' : 'user';
        const guildId = interaction.guild?.id;
        const prompt = interaction.options.getString('prompt', true);
        try {
            // Defer the reply since AI processing might take time
            await interaction.deferReply();

            if (!prompt || prompt.trim().length === 0) {
                await interaction.editReply('Please provide a valid prompt for the AI.');
                return;
            }

            // Save user's message to chat history
            await saveChatHistory(userId, {
                role: role,
                content: prompt,
                timestamp: new Date(),
                hasImage: false,
            }, username, guildId);

            // Get chat history for context
            let history = [];
            if (guildId) {
                const listChat = await ChatHistory.find({ 
                    chatId: parseInt(guildId),
                    userId: parseInt(userId)
                }).sort({ timestamp: -1 }).limit(20); // Limit to last 20 messages for context

                // Reverse to get chronological order
                listChat.reverse();

                for (const chat of listChat) {
                    history.push({
                        role: chat.role,
                        parts: [{ 'text': chat.content }],
                    });
                }
            }

            // Generate response using Gemini API
            const chat = ai.chats.create({ model: modelName, history });
            const result = await chat.sendMessage({ message: prompt });

            if (!result || !result.text) {
                await interaction.editReply('Sorry, I couldn\'t generate a response. Please try again.');
                return;
            }

            const responseText = result.text;
            // Save AI's response to chat history
            await saveChatHistory(userId, {
                role: role,
                content: responseText,
                timestamp: new Date(),
                hasImage: false,
            }, username, guildId);

            // Format the response for Discord
            const formattedText = formatMarkdownWithCode(responseText);

            // Discord has a 2000 character limit for messages
            if (formattedText.length <= 2000) {
                await interaction.editReply(formattedText);
            } else {
                // Split long responses into multiple messages
                const chunks = [];
                let currentChunk = '';
                const lines = formattedText.split('\n');

                for (const line of lines) {
                    if (currentChunk.length + line.length + 1 <= 1900) { // Leave some buffer
                        currentChunk += (currentChunk ? '\n' : '') + line;
                    } else {
                        if (currentChunk) chunks.push(currentChunk);
                        currentChunk = line;
                    }
                }
                if (currentChunk) chunks.push(currentChunk);

                // Send first chunk as reply
                await interaction.editReply(chunks[0] || 'Response was too long to display.');

                // Send remaining chunks as follow-ups
                for (let i = 1; i < chunks.length && i < 5; i++) { // Limit to 5 total messages
                    await interaction.followUp(chunks[i]);
                }

                if (chunks.length > 5) {
                    await interaction.followUp('Response was truncated due to length limits.');
                }
            }

        } catch (error) {
            logger.error('Chat command error:', error);
            
            const errorMessage = 'Sorry, there was an error processing your request. Please try again later.';
            
            if (interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            }
        }
    },
};