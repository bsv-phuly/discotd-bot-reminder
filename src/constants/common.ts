import { CronJob } from "cron";

export const userCronJobs = new Map<string, CronJob>();

export const defaultCronDays = "1-5"; // Monday to Friday

export const sizeText = {
    s: "S",
    m: "M",
    l: "L",
    S: "S",
    M: "M",
    L: "L",
    lon: "L",
    Lon: "L",
}

export const abbreviationMap: any = {
    cf: "cà phê",
    cafe: "cà phê",
    'ca phe': "cà phê",
    'cf sữa': "cà phê phin sữa đá",
    'cf sua': "cà phê phin sữa đá",
    'cf sữa nóng': "cà phê phin sữa nóng",
    sua: "sữa",
    da: "đá",
    tra: "trà",
    nóng: "nóng",
    nong: "nóng",
};