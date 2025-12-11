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

    // GET FULL HTML FIRST
    const raw = await page.content();

    // Detect CAPTCHA block
    if (raw.includes("captcha") || raw.includes("Robot Check") || raw.includes("unusual traffic")) {
        console.log("❌ Amazon blocked this request (CI/CD IP flagged).");
        process.exit(1);
    }

    // Extract DATA without waiting for selector
    let title = await page.evaluate(() =>
        document.querySelector("#productTitle")?.innerText?.trim() ||
        document.querySelector("span.a-size-large.product-title-word-break")?.innerText?.trim() ||
        "NA"
    );

    let price = await page.evaluate(() =>
        document.querySelector("span.a-price-whole")?.innerText?.trim() ||
        document.querySelector("span.a-offscreen")?.innerText?.trim() ||
        "NA"
    );

    let image = await page.evaluate(() => {
        let img = document.querySelector("#landingImage")?.src;
        if (img) return img;

        let dyn = document.querySelector("img[data-a-dynamic-image]")?.getAttribute("data-a-dynamic-image");
        if (dyn) return Object.keys(JSON.parse(dyn))[0];

        return "NA";
    });

    let inStock = await page.evaluate(() =>
        document.querySelector("#availability .a-color-success")?.innerText?.trim() ||
        document.querySelector("span.a-size-medium.a-color-success")?.innerText?.trim() ||
        "NA"
    );

    console.log("\n===== RESULT =====");
    console.log({ asin, title, price, image, inStock });
    console.log("===================\n");

    await browser.close();
})();
