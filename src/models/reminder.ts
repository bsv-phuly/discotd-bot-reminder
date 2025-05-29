import mongoose from 'mongoose';

export interface IReminder {
    chatId: number;
    linkRemind?: string;
    remindTime: string;
    cronExpression: string;
    createdAt: Date;
    updateAt: Date;
    status: boolean;
}

const reminderSchema = new mongoose.Schema<IReminder>({
    chatId: { type: Number, required: true, unique: true },
    linkRemind: String,
    remindTime: String,
    cronExpression: String,
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
    status: { type: Boolean, default: false }
});

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);