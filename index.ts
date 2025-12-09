import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    headless: true,
    browserPoolOptions: { useFingerprints: true },

    requestHandler: async ({ page, request, log }) => {
        log.info(`Checking ${request.url}...`);
        
        // ફાઈલમાં લખવા માટેનો ડેટા
        let fileContent = "";

        try {
            // 1. ટાઈટલ શોધવાનો પ્રયત્ન કરો
            await page.waitForSelector('#productTitle', { timeout: 10000 });
            
            const title = await page.locator('#productTitle').textContent();
            const price = await page.locator('.a-price .a-offscreen').first().textContent();

            console.log(`✅ SUCCESS: ${title?.trim()}`);
            fileContent = `Status: Success\nTitle: ${title?.trim()}\nPrice: ${price?.trim()}`;

        } catch (error) {
            // 2. જો Amazon બ્લોક કરે અથવા એરર આવે
            console.log("❌ Failed to scrape. Amazon might have blocked the IP.");
            
            // પાના પર શું લખ્યું છે તે ચેક કરીએ (ડીબગીંગ માટે)
            // જો CAPTCHA હશે તો તે અહીં દેખાશે
            const pageTitle = await page.title();
            fileContent = `Status: Failed\nReason: Blocked or Selector Not Found\nError Message: ${error.message}\nPage Title: ${pageTitle}`;
        }

        // 3. ગમે તે થાય, ફાઈલ તો બનવી જ જોઈએ!
        await Bun.write("result.txt", fileContent);
        console.log("📄 result.txt saved!");
    },
});

await crawler.run(['https://www.amazon.in/dp/B0CHX6NQMD']);
