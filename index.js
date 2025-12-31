import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
    const id = process.argv[2];
    const url = process.argv[3];
    const chatId = process.argv[4];
    const messageId = process.argv[5];

    const selectorsRaw = process.argv[6];
    const selectors = selectorsRaw ? JSON.parse(selectorsRaw) : null;

    console.log({
        id,
        url,
        chatId,
        messageId,
        selectors
    });
}


main();
