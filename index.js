import { chromium } from "playwright";

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

    // Try to wait for element to ATTACH (not visible)
    await page.waitForSelector("#productTitle", { state: "attached", timeout: 15000 }).catch(() => {});
    await page.waitForSelector("span.a-size-large.product-title-word-break", { state: "attached", timeout: 15000 }).catch(() => {});

    // Extract using evaluate() → works even if element not "visible"
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

    const result = { asin, title, price, image, inStock };

    console.log("\n===== RESULT =====");
    console.log(JSON.stringify(result, null, 2));
    console.log("===================\n");

    await browser.close();
})();
