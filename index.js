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

    // 🔥 GET RAW HTML FOR CAPTCHA DETECTION
    const html = await page.content();
    
    const captchaWords = [
        "captcha",
        "Robot Check",
        "unusual traffic",
        "automated access",
        "prove you're not a robot",
        "Enter the characters you see"
    ];

    const isCaptcha = captchaWords.some(word => html.toLowerCase().includes(word.toLowerCase()));

    if (isCaptcha) {
    console.log("❌ CAPTCHA detected — Amazon blocked this request.");
    console.log("Returning captcha: true");

    const btn = page.locator('button.a-button-text:has-text("Continue shopping")');
    if (await btn.count() > 0) {
        await btn.click();
    }
}


    console.log("No CAPTCHA detected ✔");

    // Continue scraping
    await page.waitForSelector("#productTitle", { state: "attached", timeout: 15000 }).catch(() => {});
    await page.waitForSelector("span.a-size-large.product-title-word-break", { state: "attached", timeout: 15000 }).catch(() => {});

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

    const result = { asin, title, price, image, inStock, captcha: false };

    console.log("\n===== RESULT =====");
    console.log(JSON.stringify(result, null, 2));
    console.log("===================\n");

    await browser.close();
})();


