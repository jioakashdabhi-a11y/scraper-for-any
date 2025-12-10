import playwright from "playwright";

const asin = process.argv[2];
if (!asin) {
  console.log("❌ ASIN not provided");
  process.exit(1);
}

const url = `https://www.amazon.in/dp/${asin}`;
console.log("👉 Scraping:", url);

try {
  const browser = await playwright.chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Amazon often shows cookies popup
  try {
    await page.click("#sp-cc-accept", { timeout: 3000 });
  } catch {}

  // wait max 15s for title
  await page.waitForSelector("#productTitle", { timeout: 15000 });

  const title = await page.$eval("#productTitle", (el) => el.innerText.trim());
  const price = await page.$eval(".a-price .a-offscreen", (el) =>
    el.innerText.trim()
  );
  const image = await page.$eval("#landingImage", (el) => el.src);

  await browser.close();

  console.log("--------- Result -----------");
  console.log("Title:", title);
  console.log("Price:", price);
  console.log("Image:", image);
  console.log("----------------------------");

} catch (err) {
  console.log("❌ FAILED");
  console.log(err.message);
  process.exit(1);
}
