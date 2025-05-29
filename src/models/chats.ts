import mongoose from 'mongoose';

export interface IChat {
    guildId: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    isActive: boolean;
    sendSummaries: boolean;
    createdAt: Date;
    cronExpression: string;
}

const chatSchema = new mongoose.Schema<IChat>({
    guildId: { type: Number, required: true, unique: true },
    type: String,
    title: String,
    isActive: Boolean,
    sendSummaries: Boolean,
    createdAt: { type: Date, default: Date.now },
    cronExpression: String,
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema);