import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

export class Database {
    constructor(private uri: string = config.mongodb.uri, private dbName: string = config.mongodb.dbName) {
        mongoose.set('strictQuery', false);
    }

    async connect(): Promise<void> {
        try {
            await mongoose.connect(this.uri, { dbName: this.dbName});
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            logger.error('Failed to connect to MongoDB' + error);
            throw error;
        }
    }

    async close(): Promise<void> {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
}