import { CronJob } from "cron";
import { abbreviationMap } from "../constants/common";

export function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function parseTimeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

export function formatTimeLine(time: string) {
    const reminderDate = parseTimeToDate(time);
    return formatTime(reminderDate);
}

export function getJobKey(chatId: number, link: string, time: string): string {
    return `${chatId}_${link}_${time}`;
}

export function stopExistingJob(userCronJobs: Map<string, CronJob>, jobKey: string) {
    const existingJob = userCronJobs.get(jobKey);
    if (existingJob) {
        existingJob.stop();
        userCronJobs.delete(jobKey);
    }
}

export function normalizeText(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toLowerCase()
        .replace(/\s+/g, ' ') // Clean multiple spaces
        .trim();
}

export function expandAbbreviations(input: string) {
    return input
        .toLowerCase()
        .split(/\s+/)
        .map(word => abbreviationMap[word] || word)
        .join(" ");
}