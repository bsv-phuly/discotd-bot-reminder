import mongoose from 'mongoose';

export interface IChat {
    guildId: number;
    title?: string;
    isActive: boolean;
    createdAt: Date;
    cronExpression: string;
}

const chatSchema = new mongoose.Schema<IChat>({
    guildId: { type: Number, required: true, unique: true },
    title: String,
    isActive: Boolean,
    createdAt: { type: Date, default: Date.now },
    cronExpression: String,
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema);