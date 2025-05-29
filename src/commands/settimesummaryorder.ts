import { ChatInputCommandInteraction } from "discord.js";

import { SlashCommandBuilder } from 'discord.js';
import { CronJob } from 'cron';
import { Reminder } from '../models/reminder';
import { getJobKey } from '../utils/commonFunction';
import { userCronJobs } from "../constants/common";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('active')
        .setDescription('Activate your saved link reminder'),

    async execute(interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;
        try {
            const setup = await Reminder.findOne({ userId });

            if (!setup?.remindTime) {
                return interaction.reply('❌ Reminder not found. Please use `/setup` to create a new reminder.');
            }

            const jobKey = getJobKey(userId, setup.linkRemind || '', setup.remindTime || '');
            const time = setup.remindTime;
            const link = setup.linkRemind;

            const job = new CronJob(
                jobKey,
                async () => {
                    try {
                        const user = await interaction.client.users.fetch(userId);
                        await user.send(`⏰ Reminder for you! 🔗 ${link}`);

                        await Reminder.updateOne(
                            { userId },
                            {
                                $set: { updateAt: new Date(), status: true },
                            },
                            { upsert: false }
                        );

                        await setup.save();
                    } catch (error) {
                        console.error(`Error during active reminder for ${userId}:`, error);
                    }
                },
                null,
                true, // start immediately
                'Asia/Bangkok'
            );

            userCronJobs.set(jobKey, job);

            await interaction.reply(`✅ Reminder for **${link}** at **${time}** is now active!`);

        } catch (error) {
            console.error('Active command error:', error);
            await interaction.reply('❌ An error occurred while activating your reminder.');
        }
    },
};
