import { PlaywrightCrawler } from 'crawlee';

// If you have a free proxy from Webshare, put it here:
// const PROXY_URL = "http://user:pass@1.2.3.4:8080";
const PROXY_URL = ""; 

const crawler = new PlaywrightCrawler({
    // If you have a proxy, uncomment this:
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: [PROXY_URL] }),

    headless: true,
    
    // Attempt to look like a real human
    browserPoolOptions: {
        useFingerprints: true, 
    },

    requestHandler: async ({ page, request, log }) => {
        log.info(`Checking ${request.url}...`);

        // 1. Wait for page to load
        try {
            await page.waitForSelector('#productTitle', { timeout: 15000 });
        } catch {
            console.log("❌ Blocked or CAPTCHA detected.");
            return;
        }

        // 2. Extract Data
        const title = await page.locator('#productTitle').textContent();
        const price = await page.locator('.a-price .a-offscreen').first().textContent();

        console.log('------------------------------------------------');
        console.log(`✅ SUCCESS! Found Product:`);
        console.log(`Title: ${title?.trim()}`);
        console.log(`Price: ${price?.trim()}`);
        console.log('------------------------------------------------');

        // 3. Save to a simple file so we can download it from GitHub
        await Bun.write("result.txt", `Title: ${title?.trim()}\nPrice: ${price?.trim()}`);
    },
});

await crawler.run(['https://www.amazon.in/dp/B0CHX6NQMD']);
