import { chromium } from "playwright";
import fs from "fs";

const asin = process.argv[2];

if (!asin) {
    console.log("❌ ASIN required");
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.amazon.in/dp/${asin}`;

    console.log(`Scraping: ${asin}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log("Page Loaded ✔");
    
    // Extract using evaluate() → works even if element not "visible"
    const title = await page.evaluate(() =>
        document.querySelector("#productTitle")?.innerText?.trim() ||
        document.querySelector("span.a-size-large.product-title-word-break")?.innerText?.trim() ||
        "NA"
    );

    const html = await page.content();

    fs.writeFileSync("page.html", html, "utf-8");
  
    await browser.close();
})();

