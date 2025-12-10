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

  await page.goto(url, { timeout: 60000 });

  const html = await page.content();

  await browser.close();

  // Extract JSON from Amazon
  const jsonMatch = html.match(/"dpEnvironmentDetails":(.*?)"asinMetadata"/s);

  let outputTitle = "";
  let outputPrice = "";
  let outputImg = "";

  if (jsonMatch) {
    try {
      const jsonString = `{${jsonMatch[1].trim().slice(0, -1)}}`;
      const data = JSON.parse(jsonString);

      outputTitle = data.productTitle || "";
      outputPrice = data.buyingOptions?.price || "";
      outputImg = data.productImage?.url || "";
    } catch {}
  }

  console.log("--------- Result -----------");
  console.log("Title:", outputTitle || "-");
  console.log("Price:", outputPrice || "-");
  console.log("Image:", outputImg || "-");
  console.log("----------------------------");

} catch (err) {
  console.log("❌ FAILED");
  console.log(err.message);
  process.exit(1);
}
