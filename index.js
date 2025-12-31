import { scrapeProduct } from "./scraper/productScraper.js";
import { sendUpdate, getPending } from "./utils/config.js";

async function main() {
  console.log("ENV CHECK:", {
    id: process.env.INPUT_ID,
    url: process.env.INPUT_URL,
    chatId: process.env.INPUT_CHATID,
    messageId: process.env.INPUT_MESSAGE_ID,
    selectors: process.env.INPUT_SELECTORS,
  });

  const id = Number(process.env.INPUT_ID);
  const url = process.env.INPUT_URL;
  const chatId = process.env.INPUT_CHATID;
  const messageId = process.env.INPUT_MESSAGE_ID;

  const selectors = process.env.INPUT_SELECTORS
    ? JSON.parse(process.env.INPUT_SELECTORS)
    : null;

  console.log({
    id,
    url,
    chatId,
    messageId,
    selectors,
  });
}

main();
