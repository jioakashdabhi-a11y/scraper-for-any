import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
    const id = process.env.INPUT_ID;
    const url = process.env.INPUT_URL;
    const chatId = process.env.INPUT_CHATID;
    const messageId = process.env.INPUT_MESSAGE_ID;
    const selectors = JSON.parse(process.env.INPUT_SELECTORS);

    console.log({ id, url, chatId, messageId, selectors });

    // const inputAsin = process.argv[2];

    // if (inputAsin) {
    //     const res = await scrapeProduct(inputAsin);
    //     await sendUpdate(res);
    // }

    // const pending = await getPending();

    // for (const asin of pending) {
    //     const data = await scrapeProduct(asin);
    //     await sendUpdate(data);
    // }

    return true;
}

main();
