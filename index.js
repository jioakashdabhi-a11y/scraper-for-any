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

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  await page.goto(url, { timeout: 60000, waitUntil: "networkidle" });

  // scroll load for lazy DOM
  await page.mouse.move(150, 200);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(2000);

  // try close cookie popup
  try {
    await page.click("#sp-cc-accept", { timeout: 3000 });
  } catch {}

  let title = "";
  let price = "";
  let image = "";

  /** Extract Title */
  try {
    await page.waitForSelector("#productTitle", { timeout: 10000 });
    title = await page.$eval("#productTitle", (el) => el.innerText.trim());
  } catch {
    // Fallback: meta title
    title = await page.title();
  }

  /** Extract Price */
  try {
    price = await page.$eval(".a-price .a-offscreen", (el) =>
      el.innerText.trim()
    );
  } catch {
    // fallback from availability block
    try {
      price = await page.$eval("#corePrice_feature_div span.a-offscreen", 
        (el) => el.innerText.trim()
      );
    } catch {}
  }

  /** Extract Image */
  try {
    image = await page.$eval("#landingImage", (el) => el.src);
  } catch {}

  await browser.close();

  if (!title) {
    console.log("❌ FAILED — Title not found");
    process.exit(1);
  }

  console.log("--------- Result -----------");
  console.log("Title:", title);
  console.log("Price:", price || "-");
  console.log("Image:", image || "-");
  console.log("----------------------------");

} catch (err) {
  console.log("❌ FAILED");
  console.log(err.message);
  process.exit(1);
}
