import puppeteer from 'puppeteer';

/**
 * Scrape Amazon India product details
 * @param {string} url - Amazon product URL
 * @returns {Object} - Product details (title, price, stock, imageUrl)
 */
export async function scrapeAmazonProduct(url) {
    let browser;
    const timeoutMs = parseInt(process.env.PUPPETEER_TIMEOUT) || 30000;

    try {
        browser = await puppeteer.launch({
            headless: process.env.PUPPETEER_HEADLESS !== 'false',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });

        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Set extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        });

        console.log(`⏳ Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: timeoutMs
        });

        // Wait for product details to load
        await page.waitForSelector('#productTitle, #title', { timeout: 10000 }).catch(() => {
            console.warn('⚠️ Product title not found immediately');
        });

        // Extract product details
        const productData = await page.evaluate(() => {
            const data = {};

            // Extract title
            const titleElement = document.querySelector('#productTitle, #title');
            data.title = titleElement ? titleElement.textContent.trim() : null;

            // Extract price - try multiple selectors
            const priceSelectors = [
                '.a-price-whole',
                '#priceblock_ourprice',
                '#priceblock_dealprice',
                '.a-price .a-offscreen',
                '#corePriceDisplay_desktop_feature_div .a-price-whole',
                '.priceToPay .a-price-whole'
            ];

            for (const selector of priceSelectors) {
                const priceElement = document.querySelector(selector);
                if (priceElement) {
                    let priceText = priceElement.textContent || priceElement.innerText;
                    // Remove currency symbols and commas
                    priceText = priceText.replace(/[₹,]/g, '').replace(/\.00$/, '').trim();
                    const price = parseFloat(priceText);
                    if (!isNaN(price) && price > 0) {
                        data.price = price;
                        break;
                    }
                }
            }

            // Extract stock status
            const stockSelectors = [
                '#availability span',
                '#availability-brief',
                '.availability span'
            ];

            let stockText = '';
            for (const selector of stockSelectors) {
                const stockElement = document.querySelector(selector);
                if (stockElement) {
                    stockText = stockElement.textContent.trim().toLowerCase();
                    break;
                }
            }

            // Determine stock status
            if (stockText.includes('in stock') || stockText.includes('available')) {
                data.stockStatus = 'IN_STOCK';
            } else if (stockText.includes('out of stock') || stockText.includes('unavailable') ||
                stockText.includes('currently unavailable')) {
                data.stockStatus = 'OUT_OF_STOCK';
            } else {
                data.stockStatus = data.price ? 'IN_STOCK' : 'UNKNOWN';
            }

            // Extract image URL
            const imageSelectors = [
                '#landingImage',
                '#imgTagWrapperId img',
                '#imageBlock img',
                '#altImages img'
            ];

            for (const selector of imageSelectors) {
                const imgElement = document.querySelector(selector);
                if (imgElement && (imgElement.src || imgElement.dataset.src)) {
                    const imgUrl = imgElement.src || imgElement.dataset.src;
                    if (imgUrl && imgUrl.startsWith('http')) {
                        data.imageUrl = imgUrl;
                        break;
                    }
                }
            }

            return data;
        });

        console.log(`✅ Scraped: ${productData.title?.substring(0, 50)}...`);

        // Validate that we got at least some data
        if (!productData.title && !productData.price) {
            throw new Error('Failed to extract product data - page might be unavailable or changed structure');
        }

        return productData;

    } catch (error) {
        console.error(`❌ Scraping error for ${url}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Scrape multiple products
 * @param {Array} products - Array of {id, url} objects
 * @returns {Array} - Array of scraped results
 */
export async function scrapeMultipleProducts(products) {
    const results = [];

    for (const product of products) {
        try {
            console.log(`\n📦 [${product.id}] Scraping product...`);

            const data = await scrapeAmazonProduct(product.url);

            results.push({
                productId: product.id,
                success: true,
                data: {
                    title: data.title,
                    latestPrice: data.price,
                    latestStock: data.stockStatus,
                    imageUrl: data.imageUrl
                }
            });

            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Failed to scrape product ${product.id}:`, error.message);

            results.push({
                productId: product.id,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}
