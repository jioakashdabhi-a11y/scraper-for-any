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
    requestHandler: async ({ page, request }) => {
        console.log(`Checking ${request.url}`);

        const title = await page.locator('#productTitle').textContent();
        const price = await page.locator('.a-price .a-offscreen').first().textContent();

        console.log("--------- Result -----------");
        console.log("Title:", title?.trim());
        console.log("Price:", price?.trim());
        console.log("----------------------------");
    },
});

await crawler.run([url]);
