import { chromium } from "playwright";
import { delay } from "../utils/config";

export const scrapeProduct = async (asin) => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await delay(300, 900);

    await page.goto(`https://www.amazon.in/dp/${asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
    });

    const html = await page.content();
    const captchaWords = ["captcha", "Robot Check", "unusual traffic", "automated access"];
    const isCaptcha = captchaWords.some(w => html.toLowerCase().includes(w.toLowerCase()));

    if (isCaptcha) {
    }
}