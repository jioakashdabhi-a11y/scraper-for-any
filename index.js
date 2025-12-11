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

    await page.goto(url, { waitUntil: "domcontentloaded" });
    console.log("Loaded page");

    // Scroll slowly to load dynamic content
    await page.evaluate(async () => {
        for (let i = 0; i < document.body.scrollHeight; i += 400) {
            window.scrollTo(0, i);
            await new Promise(res => setTimeout(res, 250));
        }
    });

    await page.waitForTimeout(2000);

    let title = "NA";
    let image = "NA";
    let inStock = "NA";
    let price = "NA";

    /** TITLE **/
    try {
        title = await page.locator("#productTitle").innerText();
    } catch {
        try {
            title = await page.locator("span.a-size-large.product-title-word-break").innerText();
        } catch {}
    }

    /** IMAGE **/
    try {
        image = await page.locator("#landingImage").getAttribute("src");
    } catch {
        try {
            const imgJson = await page.locator("img[data-a-dynamic-image]").getAttribute("data-a-dynamic-image");
            image = Object.keys(JSON.parse(imgJson))[0];
        } catch {}
    }

    /** PRICE **/
    try {
        price = await page.locator("span.a-price-whole").first().innerText();
    } catch {
        try {
            price = await page.locator("span.a-offscreen").first().innerText();
        } catch {}
    }

    /** IN STOCK **/
    try {
        inStock = await page.locator("#availability .a-color-success").innerText();
    } catch {
        try {
            inStock = await page.locator("span.a-size-medium.a-color-success").innerText();
        } catch {}
    }

    console.log("\n===== RESULT =====");
     console.log(`ASIN: ${asin}`);
    console.log(`Title: ${title}`);
    console.log(`Price: ${price}`);
    console.log(`Image: ${image}`);
    console.log(`In Stock: ${inStock}`);
    // const result = {
    //     asin,
    //     title: title.trim(),
    //     price: price.trim(),
    //     image,
    //     inStock: inStock.trim(),
    // };
    // console.log(`Result: ${result}`);
    console.log("===================\n");

    await browser.close();
})();



