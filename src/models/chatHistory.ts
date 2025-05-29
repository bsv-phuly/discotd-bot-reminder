import mongoose from 'mongoose';

export interface IChatHistory {
    id: string;
    chatId: number;
    userId: number;
    username?: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
    hasImage?: boolean;
}

const chatHistorySchema = new mongoose.Schema<IChatHistory>({
    id: { type: String, required: true, unique: true },
    chatId: { type: Number },
    userId: { type: Number },
    username: String,
    role: { type: String, default: 'user' },
    content: String,
    timestamp: { type: Date, default: Date.now },
    hasImage: { type: Boolean, default: false },
});

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);