import { PlaywrightCrawler } from 'crawlee';
import { randomUUID } from "crypto";

const crawler = new PlaywrightCrawler({
    headless: true,
    browserPoolOptions: { useFingerprints: true },

    requestHandler: async ({ page, request, log }) => {
        log.info(`Checking ${request.url}...`);

        let fileContent = "";
        let fileName = `result-${randomUUID().slice(0,6)}.txt`;

        try {
            await page.waitForSelector('#productTitle', { timeout: 10000 });

            const title = await page.locator('#productTitle').textContent();
            const price = await page.locator('.a-price .a-offscreen').first().textContent();

            console.log(`SUCCESS: ${title?.trim()}`);

            fileContent =
                `Status: Success
URL: ${request.url}
Title: ${title?.trim()}
Price: ${price?.trim()}`;

        } catch (error) {

            console.log("FAILED — Maybe Blocked.");

            const pageTitle = await page.title();

            fileContent =
                `Status: Failed
URL: ${request.url}
Reason: ${error.message}
PageTitle: ${pageTitle}`;
        }

        await Bun.write(fileName, fileContent);
        console.log(`📄 Saved: ${fileName}`);
    },
});

await crawler.run([
    'https://www.amazon.in/dp/B0CHX6NQMD'
]);
