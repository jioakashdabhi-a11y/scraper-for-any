export const TOKEN = process.env.API_TOKEN;
export const BACKEND = process.env.BACKEND_URL;

export const GET_PENDING = `${BACKEND}/api/products/pending`;
export const POST_UPDATE = `${BACKEND}/api/products/updates`;

export const delay = () => {
    const base = 300 + Math.random() * 700;
    const jitter = Math.sin(Math.random() * Math.PI) * 300;
    const time = base + jitter;
    return new Promise(res => setTimeout(res, time));
};

// Send scraped result to backend
export async function sendUpdate(data) {
    try {
        const res = await fetch(POST_UPDATE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify(data)
        });

        return {
            success: res.ok,
            status: res.status
        };

    } catch (err) {
        return {
            success: false,
            error: true,
            message: err.message
        };
    }
}

// Fetch pending products
export async function getPending() {
    try {
        const res = await fetch(GET_PENDING, {
            headers: { "Authorization": `Bearer ${TOKEN}` }
        });

        if (!res.ok) {
            return [];
        }

        return await res.json();

    } catch {
        return [];
    }
}
