import { PlaywrightCrawler } from "crawlee";

const crawler = new PlaywrightCrawler({
    headless: false,

    maxConcurrency: 1,
    navigationTimeoutSecs: 30,

    requestHandler: async ({ page, request }) => {
        console.log(`Checking → ${request.url}`);

        await page.waitForLoadState("domcontentloaded");

        await page.waitForTimeout(3000); // Real user wait

        // Example scraping (not amazon-specific)
        const title = await page.title();
        const h1 = await page.locator("h1").first().textContent().catch(() => null);

        console.log("=== RESULT ===");
        console.log("URL:", request.url);
        console.log("PAGE TITLE:", title);
        console.log("H1 TAG:", h1);
        console.log("==============");
    },
});

await crawler.run([
    "https://www.example.com/"
]);
