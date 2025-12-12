import { chromium } from "playwright";

const asin = process.argv[2];
if (!asin) {
    console.log("❌ ASIN required");
    process.exit(1);
}

async function scrapeProduct(asin, attempt = 1) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.amazon.in/dp/${asin}`;

    console.log(`\nScraping attempt ${attempt} for ASIN: ${asin}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Read HTML for captcha detection
    const html = await page.content();
    const captchaWords = ["captcha", "Robot Check", "unusual traffic", "automated access"];
    const isCaptcha = captchaWords.some(w => html.toLowerCase().includes(w.toLowerCase()));

    // -----------------------------------------------------
    // 🔥 CAPTCHA DETECTED — HANDLE + RETRY
    // -----------------------------------------------------
    if (isCaptcha) {
        console.log("❌ Amazon CAPTCHA detected.");

        // Try clicking "Continue shopping"
        try {
            const btn = page.locator('button.a-button-text:has-text("Continue shopping")');
            if (await btn.count() > 0) {
                await btn.click();
                console.log("Clicked Continue shopping ✔");
            }
        } catch {}

        await browser.close();

        // Retry max 2 times
        if (attempt < 3) {
            console.log("🔁 Retrying...");
            await new Promise(res => setTimeout(res, 2000)); // wait 2 sec
            return scrapeProduct(asin, attempt + 1);
        }

        // After all retries failed → return captcha true
        return {
            asin,
            captcha: true,
            title: "NA",
            price: "NA",
            image: "NA",
            inStock: "NA"
        };
    }

    // -----------------------------------------------------
    // 🔥 NO CAPTCHA — SCRAPE DATA
    // -----------------------------------------------------
    const data = await page.evaluate(() => {
        const pick = (s) => document.querySelector(s)?.innerText?.trim() || "NA";

        let image =
            document.querySelector("#landingImage")?.src ||
            (() => {
                const dyn = document.querySelector("img[data-a-dynamic-image]")?.getAttribute("data-a-dynamic-image");
                if (dyn) return Object.keys(JSON.parse(dyn))[0];
                return "NA";
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

    return { asin, ...data, captcha: false };
}

// Run scraper
scrapeProduct(asin).then(result => {
    console.log("\n===== FINAL RESULT =====");
    console.log(JSON.stringify(result, null, 2));
    console.log("========================\n");
});
