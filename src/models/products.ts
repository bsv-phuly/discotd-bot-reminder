import mongoose from 'mongoose';

interface IPriceUnit {
    text: string;
    value: number;
    unit: string;
}

interface IWeekDay {
    start: string;
    week_day: number;
    end: string;
}

interface ITimeProduct {
    available: Array<any>;
    week_days: Array<IWeekDay>;
    not_available: Array<any>;
}

interface IOptions {
    ntop: string;
    mandatory: boolean;
    id: number;
    option_items: IOptionItems;
}

interface IOptionItems {
    min_select: number;
    max_select: number;
    items: Array<IItemsDetails>
}

interface IItemsDetails {
    name: string;
    weight: number;
    ntop_price: IPriceUnit;
    max_quantity: number;
    id: number;
    is_default: boolean;
    top_order: number;
    price: IPriceUnit;
}

export interface IProducts {
    id: number;
    name: string;
    options: Array<IOptions>;
    discount_price?: IPriceUnit;
    discount_remaining_quantity: number;
    price: IPriceUnit;
    properties: Array<any>;
    quantity: number;
    time: ITimeProduct;
    createdAt: Date;
}

const productsSchema = new mongoose.Schema<IProducts>({
    id: { type: Number, required: true, unique: true },
    name: String,
    options: Array<IOptions>,
    discount_price: Object,
    discount_remaining_quantity: Number,
    price: Object,
    properties: Array<any>,
    quantity: Number,
    time: Object,
    createdAt: { type: Date, default: Date.now }
});

export const Products = mongoose.model<IProducts>('Products', productsSchema);