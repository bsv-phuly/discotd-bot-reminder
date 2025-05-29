import mongoose from 'mongoose';

export interface IUser {
    discordId: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    joinedDate: Date;
    lastInteraction: Date;
    messageCount: number;
}

const userSchema = new mongoose.Schema<IUser>({
    discordId: { type: Number, required: true, unique: true },
    firstName: String,
    lastName: String,
    username: String,
    joinedDate: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 }
});

export const User = mongoose.model<IUser>('User', userSchema);