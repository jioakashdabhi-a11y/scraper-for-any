export const TOKEN = process.env.API_TOKEN;
export const BACKEND = process.env.BACKEND_URL;

export const GET_PENDING = `${BACKEND}/api/products/pending`;
export const POST_UPDATE = `${BACKEND}/api/products/updates`;

export const delay = (min = 400, max = 1200) => {
    return new Promise(res => setTimeout(res, Math.random() * (max - min) + min));
};

export async function sendUpdate(data) {
    console.log(`📨 Sending update for ${data.asin}`);

    await fetch(POST_UPDATE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(data)
    }).catch(() => console.log("❌ Failed sending update"));
}

export async function getPending() {
    console.log("\n📡 Fetching pending products...");

    const res = await fetch(GET_PENDING, {
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    if (!res.ok) {
        console.log("❌ Failed to get pending products");
        return [];
    }

    return await res.json();
}
