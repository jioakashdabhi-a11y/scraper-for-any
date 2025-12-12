import { chromium } from "playwright";
import fs from "fs";

const asin = process.argv[2];

if (!asin) {
    console.log("❌ ASIN required");
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.amazon.in/dp/${asin}`;

    console.log(`Scraping: ${asin}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log("Page Loaded ✔");

    // ---------------------------
    // TRY CLICK CONTINUE SHOPPING
    // ---------------------------
    try {
        console.log("Checking for 'Continue shopping' button...");

        const continueBtn = page.getByRole("button", { name: "Continue shopping" });

        if (await continueBtn.count() > 0) {
            console.log("Continue shopping button found ✔");
            await continueBtn.click();
            console.log("Clicked 'Continue shopping' ✔");
        } else {
            console.log("No Continue shopping button found ❌");
        }
    } catch (err) {
        console.log("⚠ Error clicking Continue shopping (ignored)");
    }

    // ---------------------------
    // CAPTCHA CHECK
    // ---------------------------
    const html = await page.content();
    if (html.includes("captcha") || html.includes("Robot Check")) {
        console.log("❌ CAPTCHA detected - stopping.");
        const result = { asin, captcha: true };
        console.log(JSON.stringify(result, null, 2));
        await browser.close();
        return;
    }

    // ---------------------------
    // SCRAPE DATA
    // ---------------------------
    const title = await page.evaluate(() =>
        document.querySelector("#productTitle")?.innerText?.trim() ||
        document.querySelector("span.a-size-large.product-title-word-break")?.innerText?.trim() ||
        "NA"
    );

    const price = await page.evaluate(() =>
        document.querySelector("span.a-price-whole")?.innerText?.trim() ||
        document.querySelector("span.a-offscreen")?.innerText?.trim() ||
        "NA"
    );

    const image = await page.evaluate(() => {
        const img1 = document.querySelector("#landingImage")?.src;
        if (img1) return img1;

        const dyn = document.querySelector("img[data-a-dynamic-image]")?.getAttribute("data-a-dynamic-image");
        if (dyn) return Object.keys(JSON.parse(dyn))[0];

        return "NA";
    });

    const inStock = await page.evaluate(() =>
        document.querySelector("#availability .a-color-success")?.innerText?.trim() ||
        document.querySelector("span.a-size-medium.a-color-success")?.innerText?.trim() ||
        "NA"
    );

    const result = {
        asin,
        title,
        price,
        image,
        inStock,
        captcha: false
    };

    console.log("\n===== RESULT =====");
    console.log(JSON.stringify(result, null, 2));
    console.log("===================\n");

    await browser.close();
})();
