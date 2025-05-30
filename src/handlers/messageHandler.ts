import { Client, Message } from 'discord.js';
import { IOrder } from '../models/orders';
import { OrderRepository, UserRepository, GuildRepository } from '../database/repository';
import { User } from 'discord.js';
import { logger } from '../utils/logger';

export class MessageHandler {
    private orderRepository: OrderRepository;
    private userRepository: UserRepository;
    private guildRepository: GuildRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
        this.userRepository = new UserRepository();
        this.guildRepository = new GuildRepository();
    }

    parseOrderMessage(message: string): { productName: string; amount: number } | null {
        try {
            // Split by common delimiters: +, comma, or newlines
            const items = message.split(/[+,\n]+/).map(item => item.trim()).filter(item => item.length > 0);

            let totalAmount = 0;
            const products: string[] = [];

            for (const item of items) {
                // Regular expression to match "product name - amount(k)" or "product name amount(k)"
                let regex = /(.+?)\s*-\s*(\d+)k$/i;
                let match = item.match(regex);

                if (!match) {
                    // Second pattern: "product name amount(k)" (without dash)
                    regex = /(.+?)\s+(\d+)k$/i;
                    match = item.match(regex);
                }

                if (match) {
                    const productName = match[1].trim();
                    const amount = parseInt(match[2]) * 1000;

                    products.push(productName);
                    totalAmount += amount;
                } else {
                    // If any item doesn't match the expected format, return null
                    logger.error(`Invalid format for item: ${item}`);
                    return null;
                }
            }

            if (products.length === 0) {
                return null;
            }

            // Join all product names with " + " for multiple products
            const combinedProductName = products.join(' + ');

            return {
                productName: combinedProductName,
                amount: totalAmount
            };

        } catch (error) {
            logger.error('Error parsing order message:', error);
            return null;
        }
    }

    async saveOrder(userId: string, guildId: string, message: string): Promise<IOrder | null> {
        try {
            const parsedOrder = this.parseOrderMessage(message);
            if (!parsedOrder) return null;

            // Convert Discord IDs to numbers for consistency with your schema
            const userIdNum = parseInt(userId);
            const guildIdNum = parseInt(guildId);

            const order: Partial<IOrder> = {
                userId: userIdNum,
                chatId: guildIdNum,
                productName: parsedOrder.productName,
                amount: parsedOrder.amount,
                createdAt: new Date()
            };

            const savedOrder = await this.orderRepository.createOrUpdate(order as IOrder);
            return savedOrder;
        } catch (error) {
            logger.error('Error saving order:', error);
            return null;
        }
    }

    async updateUserActivity(user: User): Promise<void> {
        try {
            await this.userRepository.saveUser({
                discordId: Number(user.id),
                username: user.username,
            });
        } catch (error) {
            logger.error('Error updating user activity:', error);
        }
    }

    async handleOrderMessage(message: Message): Promise<void> {
        const parsedOrder = this.parseOrderMessage(message.content);

        if (parsedOrder) {
            const savedOrder = await this.saveOrder(
                message.author.id,
                message.guild!.id,
                message.content
            );

            if (savedOrder) {
                // React with success emoji
                await message.react('✅');

                // Optional: Send confirmation reply
                await message.reply({
                    content: `📝 Order recorded: **${parsedOrder.productName}** - ${parsedOrder.amount.toLocaleString()}đ`,
                    allowedMentions: { repliedUser: false }
                });

                console.log(`✅ Order saved: ${message.author.tag} ordered ${parsedOrder.productName} for ${parsedOrder.amount}`);
            } else {
                // React with error emoji
                await message.react('❌');
                console.log(`❌ Failed to save order for ${message.author.tag}`);
            }
        }
    }
}

// Create singleton instance
const messageHandler = new MessageHandler();

export async function handleMessage(message: Message): Promise<void> {
    // Ignore bot messages
    if (message.author.bot) return;
    const guild = message.guild;
    if (!guild) {
        await message.reply({
            content: 'This command can only be used in a server!',
        });
        return;
    }

    // Update user activity
    await messageHandler.updateUserActivity(message.author);

    // Handle messages in text channels
    if (message.guild && message.channel.isTextBased()) {
        const channelName = 'name' in message.channel ? message.channel.name : 'DM/Private Channel';
        console.log(`[${message.guild.name}] #${channelName}: ${message.author.tag}: ${message.content}`);

        // Try to parse and handle order messages first
        await messageHandler.handleOrderMessage(message);

        // Handle other message patterns
        if (message.content.toLowerCase().includes('hello')) {
            message.reply('Hi there! 👋');
        }
    }
}