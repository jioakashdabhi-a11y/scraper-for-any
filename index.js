import cheerio from "cheerio";

const asin = process.argv[2];
if (!asin) {
    console.log("❌ ASIN not provided");
    process.exit(1);
}

const url = `https://www.amazon.in/dp/${asin}`;

console.log("👉 Scraping:", url);

try {
    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept-Language": "en-IN,en;q=0.9",
        },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("#productTitle").text().trim();
    const price = $(".a-price .a-offscreen").first().text().trim();
    const img = $("#landingImage").attr("src");

    if (!title) {
        console.log("❌ Blocked OR Failed");
        process.exit(1);
    }

    console.log("--------- Result -----------");
    console.log("Title:", title || "-");
    console.log("Price:", price || "-");
    console.log("Image:", img || "-");
    console.log("----------------------------");

} catch (err) {
    console.log("Error:", err.message);
}
