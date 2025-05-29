import mongoose from 'mongoose';
import { IOrder } from './orders'

export interface IDailyTotal {
    userId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    totalAmount: number;
    orderCount: number;
    createdAt: Date;
    orders: IOrder[];
}

const dailyTotalSchema = new mongoose.Schema<IDailyTotal>({
    userId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    totalAmount: Number,
    orderCount: Number,
    orders: Array<IOrder>,
    createdAt: { type: Date, default: Date.now }
});

export const DailyTotal = mongoose.model<IDailyTotal>('DailyTotal', dailyTotalSchema);