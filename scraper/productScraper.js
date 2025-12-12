import { chromium } from "playwright";
import { delay } from "../utils/config";

const MAX_RETRY = 3;

export const scrapeProduct = async (asin, attempt = 1) => {
    console.log(`🔍 Scraping ASIN: ${asin} | Attempt ${attempt}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await delay(300, 900);

    await page.goto(`https://www.amazon.in/dp/${asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
    });

    // Detect CAPTCHA
    const html = await page.content();
    const captchaWords = ["captcha", "robot check", "unusual traffic", "automated access"];
    const isCaptcha = captchaWords.some(w => html.toLowerCase().includes(w.toLowerCase()));

    if (isCaptcha) {
        console.log("⚠ CAPTCHA detected.");

        try {
            const btn = page.locator('button.a-button-text:has-text("Continue shopping")');

            if (await btn.count() > 0) {
                console.log("🟡 Continue Shopping button found");

                await btn.click();
                console.log("🟢 Clicked Continue Shopping");

                // IMPORTANT: Do NOT close browser here
                await Promise.race([
                    page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}),
                    delay(1500, 2500)
                ]);

                console.log("🔄 Page updated after Continue Shopping click");
            } else {
                console.log("⚪ No Continue Shopping button found");
            }

        } catch (err) {
            console.log("❌ Error clicking Continue Shopping", err.message);
        }

        // After clicking Continue Shopping → retry AGAIN using SAME browser session
        if (attempt < MAX_RETRY) {
            console.log("🔁 Retrying after captcha bypass...");
            await delay(1500, 2500);

            // ❗ DO NOT close browser
            await browser.close();

            return scrapeProduct(asin, attempt + 1);
        }

        // FINAL FAIL AFTER ALL RETRIES
        await browser.close();
        return {
            asin,
            title: "NA",
            price: "NA",
            image: "NA",
            inStock: "NA",
            captcha: true
        };
    }

    // No CAPTCHA → continue scraping
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
