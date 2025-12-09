import { PlaywrightCrawler } from "crawlee";

const crawler = new PlaywrightCrawler({
    headless: true,
    maxConcurrency: 1,
    navigationTimeoutSecs: 30,

    requestHandler: async ({ page, request }) => {
        console.log(`Scraping => ${request.url}`);

        // Wait page loaded
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        // Try product title
        let title = await page.locator("#productTitle").textContent().catch(() => null);

        // Try fallback (Amazon sometimes wraps in span)
        if (!title) {
            title = await page.locator("span#productTitle").textContent().catch(() => null);
        }

        // Try price selectors
        let price =
            await page.locator(".a-price .a-offscreen").first().textContent().catch(() => null)
            || await page.locator("#priceblock_dealprice").textContent().catch(() => null)
            || await page.locator("#priceblock_ourprice").textContent().catch(() => null);

        // Try image
        const image = await page.locator("#landingImage").getAttribute("src").catch(() => null);

        console.log("\n======== SCRAPE RESULT ========");
        console.log("URL:", request.url);
        console.log("TITLE:", title?.trim());
        console.log("PRICE:", price?.trim());
        console.log("IMAGE:", image);
        console.log("================================\n");
    },
});

await crawler.run([
    "https://www.amazon.in/dp/B0CHX6NQMD"
]);
