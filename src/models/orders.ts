import mongoose, { Types } from 'mongoose';
import { Counter } from './counter.mode';

export interface IOrder {
    orderId: number;
    chatId: number;
    userId: number;
    productName: string;
    amount: number;
    createdAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
    orderId: { type: Number, unique: true },
    chatId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true, index: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: true }
});

orderSchema.pre('save', async function (next) {
    const doc = this as IOrder & mongoose.Document;

    if (doc.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'orderId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        doc.orderId = counter!.seq;
    }

    next();
});


export const Order = mongoose.model<IOrder>('Order', orderSchema);