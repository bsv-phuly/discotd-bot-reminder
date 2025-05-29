import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Config {
    mongodb: {
        uri: string;
        dbName: string;
    };
    disbord: {
        token: string;
        clientId: string;
        guideId: string;
        permissionNumber: string;
    };
    scheduler: {
        summaryTime: string;
        timezone: string;
    };
    port: string;
    environment: string;
}

function getEnvVariable(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const config: Config = {
    mongodb: {
        uri: getEnvVariable('MONGODB_URI', 'mongodb://localhost:27017/disbord-bot'),
        dbName: getEnvVariable('DB_NAME', 'disbord-bot'),
    },
    disbord: {
        token: getEnvVariable('DISCORD_TOKEN'),
        clientId: getEnvVariable('CLIENT_ID'),
        guideId: getEnvVariable('GUILD_ID'),
        permissionNumber: getEnvVariable('PERMISSION_NUMBER'),
    },
    scheduler: {
        summaryTime: getEnvVariable('CRON_TIME', '0 17 * * *'),
        timezone: getEnvVariable('TIMEZONE', 'Asia/Ho_Chi_Minh'),
    },
    port: getEnvVariable('PORT', '3000'),
    environment: getEnvVariable('NODE_ENV', 'development'),
};