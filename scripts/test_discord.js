// scripts/test_discord.js
// Run with: node scripts/test_discord.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
let webhookUrl = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DISCORD_WEBHOOK_URL=(https:\/\/discord\.com\/api\/webhooks\/[^\s]+)/);
    if (match && match[1]) {
        webhookUrl = match[1].trim(); // Trim to be safe
    }
} catch (e) {
    console.error("Could not read .env.local");
}

if (!webhookUrl) {
    console.error("❌ No DISCORD_WEBHOOK_URL found in .env.local");
    process.exit(1);
}

console.log("Found Webhook URL. Sending test via fetch...");

async function sendTest() {
    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: "✅ **Kairos Connection Test**: System Online!"
            })
        });

        if (res.ok) {
            console.log("✅ Success! Check Discord.");
        } else {
            const txt = await res.text();
            console.error(`❌ Failed: ${res.status} ${res.statusText}`);
            console.error("Response:", txt);
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
    }
}

sendTest();
