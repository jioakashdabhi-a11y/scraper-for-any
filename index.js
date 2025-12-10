import { chromium } from "playwright";

const asin = process.argv[2];

if (!asin) {
    console.log("❌ ASIN required");
    process.exit(1);
}

const url = `https://www.amazon.in/dp/${asin}`;
console.log("👉 Scraping:", url);

const browser = await chromium.launch({
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
    ]
});

const page = await browser.newPage();

// BASIC USER-AGENT
await page.setExtraHTTPHeaders({
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
});

try {
    await page.goto(url, { timeout: 40000, waitUntil: "domcontentloaded" });

    // WAIT ANY ONE SELECTOR (FALLBACK)
    await Promise.race([
        page.waitForSelector("#productTitle", { timeout: 20000 }),
        page.waitForSelector("#title", { timeout: 20000 }),
        page.waitForSelector("h1", { timeout: 20000 })
    ]);

    const title =
        await page.locator("#productTitle").textContent()
        || await page.locator("h1").first().textContent()
        || "-";

    console.log("\n========= RESULT =========");
    console.log("TITLE:", title.trim());
    console.log("==========================");
} catch (err) {
    console.log("❌ FAILED");
    console.log(err.message);
    process.exit(1);
}

await browser.close();
