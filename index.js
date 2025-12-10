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

    // wait for product title
    await page.waitForSelector("#productTitle", { timeout: 8000 });

    const title = await page.locator("#productTitle").innerText();
    const price = await page.locator("span.a-price-whole").first().innerText();
    const rating = await page.locator("span.a-icon-alt").first().innerText();

    console.log(`Title: ${title}`);
    console.log(`Price: ${price}`);
    console.log(`Rating: ${rating}`);

    await browser.close();
})();
