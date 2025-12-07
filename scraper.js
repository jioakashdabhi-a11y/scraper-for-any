import axios from 'axios';
import dotenv from 'dotenv';
import { scrapeMultipleProducts } from './utils/amazonScraper.js';

dotenv.config();

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';
const SCRAPER_API_TOKEN = process.env.SCRAPER_API_TOKEN;

if (!SCRAPER_API_TOKEN) {
    console.error('❌ SCRAPER_API_TOKEN not found in environment variables');
    process.exit(1);
}

/**
 * Fetch active products from backend
 */
async function fetchActiveProducts() {
    try {
        console.log('📡 Fetching active products from backend...');

        const response = await axios.get(`${BACKEND_API_URL}/api/products/active`, {
            headers: {
                'Authorization': `Bearer ${SCRAPER_API_TOKEN}`
            }
        });

        if (!response.data.success) {
            throw new Error('Failed to fetch products: ' + response.data.error);
        }

        console.log(`✅ Found ${response.data.count} products to scrape\n`);

        return response.data.products;
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        throw error;
    }
}

/**
 * Update backend with scraped data
 */
async function updateBackend(productId, scrapedData) {
    try {
        const response = await axios.post(
            `${BACKEND_API_URL}/api/products/updateFromScraper`,
            {
                productId,
                ...scrapedData
            },
            {
                headers: {
                    'Authorization': `Bearer ${SCRAPER_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            const { notifyUser, usersToNotify, reason } = response.data;

            if (notifyUser) {
                console.log(`   🔔 Triggered ${usersToNotify} notification(s) - Reason: ${reason}`);
            } else {
                console.log(`   ℹ️  No notifications triggered`);
            }
        }

        return response.data;
    } catch (error) {
        console.error(`   ❌ Error updating backend:`, error.response?.data || error.message);
        throw error;
    }
}

/**
 * Main scraper function
 */
async function runScraper() {
    const startTime = Date.now();

    console.log('🚀 Amazon Price Tracker - Scraper Started');
    console.log(`📅 ${new Date().toISOString()}\n`);
    console.log('='.repeat(60));

    try {
        // Fetch products to scrape
        const products = await fetchActiveProducts();

        if (!products || products.length === 0) {
            console.log('ℹ️  No products to scrape. Exiting...');
            return;
        }

        // Scrape products
        console.log('🕷️  Starting scraping process...\n');
        const results = await scrapeMultipleProducts(products);

        // Update backend with results
        console.log('\n📤 Updating backend with scraped data...\n');

        let successCount = 0;
        let failureCount = 0;

        for (const result of results) {
            console.log(`\n[Product ${result.productId}]`);

            if (result.success) {
                try {
                    await updateBackend(result.productId, result.data);
                    successCount++;
                    console.log(`   ✅ Updated successfully`);
                } catch (error) {
                    failureCount++;
                }
            } else {
                failureCount++;
                console.log(`   ❌ Skipped due to scraping error: ${result.error}`);
            }
        }

        // Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('📊 Scraping Summary');
        console.log('='.repeat(60));
        console.log(`Total products: ${products.length}`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${failureCount}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Scraper failed:', error.message);
        process.exit(1);
    }
}

// Run scraper
runScraper()
    .then(() => {
        console.log('\n✨ Scraper completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Scraper failed:', error);
        process.exit(1);
    });
