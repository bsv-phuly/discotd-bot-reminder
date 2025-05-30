import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Config {
    mongodb: {
        uri: string;
        dbName: string;
    };
    discord: {
        token: string;
        clientId: string;
        guildId: string;
        permissionNumber: string;
    };
    ai: {
        gemini_key: string;
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
        uri: getEnvVariable('MONGODB_URI', 'mongodb://localhost:27017/discord-bot'),
        dbName: getEnvVariable('DB_NAME', 'discord-bot'),
    },
    discord: {
        token: getEnvVariable('DISCORD_TOKEN'),
        clientId: getEnvVariable('CLIENT_ID'),
        guildId: getEnvVariable('GUILD_ID'),
        permissionNumber: getEnvVariable('PERMISSION_NUMBER'),
    },
    ai: {
        gemini_key: getEnvVariable('GEMINI_API_KEY'),
    },
    scheduler: {
        summaryTime: getEnvVariable('CRON_TIME', '0 17 * * *'),
        timezone: getEnvVariable('TIMEZONE', 'Asia/Ho_Chi_Minh'),
    },
    port: getEnvVariable('PORT', '3000'),
    environment: getEnvVariable('NODE_ENV', 'development'),
};