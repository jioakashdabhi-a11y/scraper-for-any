import { PlaywrightCrawler } from "crawlee";

const asin = process.argv[2];

if (!asin) {
    console.log("❌ ASIN not provided");
    process.exit(1);
}

const url = `https://www.amazon.in/dp/${asin}`;
console.log("👉 Scraping:", url);

const crawler = new PlaywrightCrawler({
    headless: true,
    navigationTimeoutSecs: 60,

    requestHandler: async ({ page, request }) => {
        console.log(`🔎 Checking page: ${request.url}`);

        try {
            await page.waitForSelector('#productTitle', { timeout: 20000 });

            const title = await page.locator('#productTitle').textContent();

            console.log("========= RESULT =========");
            console.log("TITLE:", title?.trim());
            console.log("==========================");

        } catch (err) {
            console.log("❌ FAILED TO SCRAPE TITLE");
            console.log("Error:", err?.message);
            process.exit(1);
        }
    },
});

await crawler.run([url]);
