import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    headless: true,
    browserPoolOptions: { useFingerprints: true },

    maxConcurrency: 1,
    navigationTimeoutSecs: 30,

    preNavigationHooks: [
        async ({ page }) => {
            await page.setExtraHTTPHeaders({
                'accept-language': 'en-US,en;q=0.9',
            });

            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/122.0.0.0 Safari/537.36'
            );

            await page.waitForTimeout(2000);
            await page.mouse.move(200, 300);
            await page.waitForTimeout(1000);
        },
    ],

    requestHandler: async ({ page, request, log }) => {
        log.info(`Checking ${request.url}...`);

        try {
            await page.waitForSelector('#productTitle', { timeout: 10000 });

            const title = await page.locator('#productTitle').textContent();
            const price = await page
                .locator('.a-price .a-offscreen')
                .first()
                .textContent();

            console.log("\n========= SUCCESS =========");
            console.log("URL:", request.url);
            console.log("TITLE:", title?.trim());
            console.log("PRICE:", price?.trim());
            console.log("===========================\n");

        } catch (error) {
            const pageTitle = await page.title();

            console.log("\n########### FAILED ###########");
            console.log("URL:", request.url);
            console.log("Error:", error.message);
            console.log("Page Title:", pageTitle);
            console.log("##############################\n");
        }
    },
});

await crawler.run([
    'https://www.amazon.in/dp/B0CHX6NQMD',
]);
