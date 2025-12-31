import { chromium } from "playwright";
import { delay } from "../utils/config";

const MAX_RETRY = 2;

export const scrapeProduct = async (url, selectors, attempt = 1) => {
    let browser;

    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await delay();

        // 🔹 CAPTCHA detection
        let html = await page.content();
        const isCaptcha = html.toLowerCase().includes("captcha");

        if (isCaptcha && selectors.captcha?.text) {
            const btn = page.locator(
                `button:has-text("${selectors.captcha.text}")`
            );

            if (await btn.count() > 0) {
                await btn.click();
                await Promise.race([
                    page.waitForLoadState("networkidle", { timeout: 7000 }),
                    delay()
                ]);
            }

            html = await page.content();
            if (html.toLowerCase().includes("captcha")) {
                throw new Error("Captcha still present");
            }
        }

        const data = {};

        // 🔹 Extract selectors
        for (const [key, selector] of Object.entries(selectors)) {
            if (key === "captcha") continue;

            try {
                // fallback selectors support
                const selList = Array.isArray(selector)
                    ? selector
                    : [selector];

                for (const sel of selList) {
                    const value = await page.evaluate((s) => {
                        const el = document.querySelector(s);
                        if (!el) return null;
                        return el.src || el.innerText?.replace(/\s+/g, " ").trim();
                    }, sel);

                    if (value) {
                        data[key] = (key === "price" || "mrp") ? cleanPrice(value) : value;
                        break;
                    }
                }

                if (!data[key]) data[key] = null;

            } catch {
                data[key] = null;
            }
        }

        await browser.close();
        return data;

    } catch (err) {
        if (browser) await browser.close();

        if (attempt < MAX_RETRY) {
            await delay(2000);
            return scrapeProduct(url, selectors, attempt + 1);
        }

        return {
            error: true,
            message: err.message
        };
    }
};

const cleanPrice = (text) => {
    if (!text) return null;

    const cleaned = text
        .replace(/[₹\n]/g, "")
        .replace(/\.00$/, "")
        .replace(/\s*\.$/, "")
        .trim();


    return cleaned;
}
