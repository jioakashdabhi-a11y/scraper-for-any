import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
    const id = process.env.INPUT_ID;
    const url = process.env.INPUT_URL;
    const chatId = process.env.INPUT_CHATID;
    const messageId = process.env.INPUT_MESSAGE_ID;

    const selectorsRaw = process.env.INPUT_SELECTORS;
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
