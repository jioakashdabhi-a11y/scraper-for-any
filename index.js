import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
    const inputAsin = process.argv[2];

    if (inputAsin) {
        const res = await scrapeProduct(inputAsin);
        await sendUpdate(res);
    }

    const pending = await getPending();

    for (const asin of pending) {
        const data = await scrapeProduct(asin);
        await sendUpdate(data);
    }

    return true;
}

main();
