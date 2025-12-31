import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
    console.log(process.argv);

    const id = process.argv[2];
    const url = process.argv[3];
    const chatId = process.argv[4];
    const messageId = process.argv[5];
    const selectors = process.argv[6]
        ? JSON.parse(process.argv[6])
        : null;

    console.log({ id, url, chatId, messageId, selectors });

}


main();
