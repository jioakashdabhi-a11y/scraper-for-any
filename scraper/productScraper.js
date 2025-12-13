import { chromium } from "playwright";
import { delay } from "../utils/config";

const MAX_RETRY = 3;

export const scrapeProduct = async (asin, attempt = 1) => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await delay(300, 900);

    await page.goto(`https://www.amazon.in/dp/${asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
    });

    // Check captcha
    const html = await page.content();
    const isCaptcha = html.toLowerCase().includes("captcha");

    if (isCaptcha) {
        // Try Continue Shopping button (NO browser.close)
        try {
            const btn = page.locator('button.a-button-text:has-text("Continue shopping")');

            if (await btn.count() > 0) {
                await btn.click();

                await Promise.race([
                    page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}),
                    delay(1500, 2500)
                ]);
            }
        } catch {}

        // 🔍 Re-check CAPTCHA after clicking Continue Shopping
        const html2 = await page.content();
        const stillCaptcha = html2.toLowerCase().includes("captcha");

        if (stillCaptcha) {
            // ❗ NOW close browser before retry
            await browser.close();

            if (attempt < MAX_RETRY) {
                await delay(1500, 2500);
                return scrapeProduct(asin, attempt + 1);
            }

            return {
                asin,
                title: "NA",
                price: "NA",
                image: "NA",
                inStock: "NA",
                captcha: true
            };
        }

        // 😎 Captcha bypassed successfully — continue scraping SAME BROWSER
    }

    // Extract data normally
    await delay(300, 600);

    const data = await page.evaluate(() => {
        const pick = sel => document.querySelector(sel)?.innerText?.trim() || "NA";

        let image =
            document.querySelector("#landingImage")?.src ||
            (() => {
                const dyn = document.querySelector("img[data-a-dynamic-image]")?.getAttribute("data-a-dynamic-image");
                if (!dyn) return "NA";
                return Object.keys(JSON.parse(dyn))[0];
            })();

        return {
            title:
                pick("#productTitle") ||
                pick("span.a-size-large.product-title-word-break"),
            price:
                pick("span.a-price-whole") ||
                pick("span.a-offscreen"),
            inStock:
                pick("#availability .a-color-success") ||
                pick("span.a-size-medium.a-color-success"),
            image
        };
    });

    await browser.close();
    await delay(1200, 2500);

    return { asin, ...data, captcha: false };
};