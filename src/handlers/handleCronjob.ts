import { config } from '../config';
import { CronJob } from 'cron';

export class DailySummaryCronJob {
    private job: CronJob;

    constructor(private timeJob: string, private functionJob: () => void) {
        this.job = this.createJob(this.timeJob, this.functionJob);
    }

    private createJob(cronTime: string, handleFunction: () => void): CronJob {
        return new CronJob(
            cronTime,
            handleFunction,
            null,
            false,
            config.scheduler.timezone
        );
    }

    updateCronTime(cronTime: string, handleFunction: () => void): void {
        // Stop the existing job
        if (this.job.isActive) {
            this.job.stop();
        }

        // Create a new job with the updated time
        this.job = this.createJob(cronTime, handleFunction);

        // Start the new job if needed
        if (this.wasRunning) {
            this.job.start();
        }

        console.log(`Cron job schedule updated to: ${cronTime}`);
    }

    get wasRunning(): boolean {
        return this.job.isActive;
    }

    start(): void {
        if (!this.job.isActive) {
            this.job.start();
            console.log(`Daily summary cron job started with schedule: ${this.timeJob}`);
        }
    }

    stop(): void {
        if (this.job.isActive) {
            this.job.stop();
            console.log('Daily summary cron job stopped');
        }
    }
}