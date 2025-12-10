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

    // block detection reduce
    preNavigationHooks: [
        async ({ page }) => {
            await page.setExtraHTTPHeaders({
                "accept-language": "en-GB,en;q=0.9",
            });

            // wait for dom build
            await page.waitForTimeout(3000);
        },
    ],

    requestHandler: async ({ page, request }) => {
        console.log(`Checking ${request.url}`);

        try {
            // Amazon slow loading → increase wait
            await page.waitForSelector('#productTitle', { timeout: 60000 });

            const title = await page.locator('#productTitle').textContent();
            const price = await page.locator('.a-price .a-offscreen').first().textContent();

            console.log("--------- Result -----------");
            console.log("Title:", title?.trim());
            console.log("Price:", price?.trim());
            console.log("----------------------------");
        } catch (err) {
            console.log("❌ FAILED");
            console.log(err.message);
        }
    },
});

await crawler.run([url]);
