import { chromium } from "playwright";

const asin = process.argv[2];

if (!asin) {
    console.log("❌ ASIN required");
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch({
        headless: true,
    });

    const page = await browser.newPage();

    const url = `https://www.amazon.in/dp/${asin}`;

    console.log(`Scraping: ${asin}`);

    await page.goto(url, { waitUntil: "networkidle" });

    await page.waitForTimeout(1500 + Math.random() * 2000);

    await page.waitForSelector("#productTitle, span.a-size-large.product-title-word-break", {
        timeout: 15000
    });

    let title = await page.locator("#productTitle").innerText().catch(async () => {
        return await page.locator("span.a-size-large.product-title-word-break").innerText();
    });

    let price = await page.locator("span.a-price-whole").first().innerText().catch(() => "NA");

    let rating = await page.locator("span.a-icon-alt").first().innerText().catch(() => "NA");

    console.log(`Title: ${title}`);
    console.log(`Price: ${price}`);
    console.log(`Rating: ${rating}`);

    await browser.close();
})();
