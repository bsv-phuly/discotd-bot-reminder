import { Chat, IChat } from "../../models/chats";
import { IOrder, Order } from "../../models/orders";
import { IProducts, Products } from "../../models/products";
import { IUser, User } from "../../models/user";
import { expandAbbreviations, normalizeText } from "../../utils/commonFunction";
import { logger } from "../../utils/logger";

export class UserRepository {
    async findByDiscordId(discordId: string): Promise<IUser | null> {
        return User.findOne({ discordId }).lean();
    }

    async saveUser(user: IUser): Promise<IUser> {
        return User.findOneAndUpdate(
            { discordId: user.discordId },
            user,
            { upsert: true, new: true }
        ).lean();
    }

    async getUsersWithOrdersInDateRange(startDate: Date, endDate: Date): Promise<IUser[]> {
        const userIds = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).distinct('userId');

        return User.find({ discordId: { $in: userIds } }).lean();
    }

    async getAllUsers(): Promise<IUser[]> {
        return User.find({}).lean();
    }

    async updateUserActivity(discordId: string): Promise<void> {
        await User.findOneAndUpdate(
            { discordId },
            { lastActivity: new Date() },
            { upsert: true }
        );
    }
}

export class OrderRepository {
    async createOrUpdate(order: IOrder): Promise<IOrder> {
        const newOrder = new Order(order);
        await newOrder.save();
        return newOrder;
    }

    async getOrder(guildId: string, userId: string): Promise<IOrder | null> {
        return Order.findOne({ guildId, userId }).lean();
    }

    async getOrdersInDateRange(startDate: Date, endDate: Date): Promise<IOrder[]> {
        return Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).lean();
    }

    async getOrdersForDay(date: Date = new Date()): Promise<IOrder[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.getOrdersInDateRange(startOfDay, endOfDay);
    }

    async getUsersWithOrdersToday(): Promise<IUser[]> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).distinct('userId');

        return User.find({ discordId: { $in: orders } }).lean();
    }

    async getOrdersByGuild(guildId: string): Promise<IOrder[]> {
        return Order.find({ guildId }).lean();
    }

    async deleteOrder(orderId: string): Promise<boolean> {
        const result = await Order.findByIdAndDelete(orderId);
        return !!result;
    }
}

export class GuildRepository {
    async findByGuildId(guildId: string): Promise<IChat | null> {
        return Chat.findOne({ guildId }).lean();
    }

    async saveGuild(guild: IChat): Promise<IChat> {
        return Chat.findOneAndUpdate(
            { guildId: guild.guildId },
            guild,
            { upsert: true, new: true }
        ).lean();
    }

    async createGuild(guild: IChat): Promise<IChat> {
        const newGuild = new Chat(guild);
        await newGuild.save();
        return newGuild;
    }

    async getActiveGuilds(sendSummaries: boolean = true): Promise<IChat[]> {
        return Chat.find({
            type: 'guild',
            isActive: true,
            sendSummaries
        }).lean();
    }

    async updateSummarySetting(guildId: string, sendSummaries: boolean): Promise<void> {
        await Chat.findOneAndUpdate(
            { guildId },
            { $set: { sendSummaries } }
        );
    }

    async updateGuildSettings(guildId: string, settings: Partial<IChat>): Promise<IChat | null> {
        return Chat.findOneAndUpdate(
            { guildId },
            { $set: settings },
            { new: true }
        ).lean();
    }

    async setGuildActive(guildId: string, isActive: boolean): Promise<void> {
        await Chat.findOneAndUpdate(
            { guildId },
            { $set: { isActive } }
        );
    }
}

export class ProductRepository {
    async createProducts(products: IProducts[]): Promise<any> {
        try {
            console.log(products, 'create products');
            const result = await Products.insertMany(products);
            return result;
        } catch (error) {
            logger.error("Failed to create products", error);
            throw error;
        }
    }

    async searchProducts(input: string): Promise<any[]> {
        try {
            const expandedInput = expandAbbreviations(input);
            const searchResults = await Products.collection.find({
                name: { $regex: expandedInput, $options: 'i' }
            }).toArray();
            console.log(searchResults, 'searchResults');

            const normalizedSearch = normalizeText(expandedInput);
            const searchWords = normalizedSearch.split(/\s+/);
            console.log(searchWords, 'searchWords');

            return searchResults.filter(doc => {
                const normalizedName = normalizeText(doc.name);
                console.log('normalizedName from doc', normalizedName);
                return searchWords.every(word => normalizedName.includes(word));
            });
        } catch (error) {
            logger.error("Failed to search products", error);
            return [];
        }
    }

    async getProductById(productId: string): Promise<IProducts | null> {
        return Products.findById(productId).lean();
    }

    async getAllProducts(): Promise<IProducts[]> {
        return Products.find({}).lean();
    }

    async updateProduct(productId: string, updates: Partial<IProducts>): Promise<IProducts | null> {
        return Products.findByIdAndUpdate(productId, updates, { new: true }).lean();
    }

    async deleteProduct(productId: string): Promise<boolean> {
        const result = await Products.findByIdAndDelete(productId);
        return !!result;
    }

    async getProductsByCategory(category: string): Promise<IProducts[]> {
        return Products.find({ category }).lean();
    }
}