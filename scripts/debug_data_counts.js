
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
    console.error("No SERVICE ROLE KEY found. Can't verify backend data.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkData() {
    console.log("🔍 Checking Analytics Data (Service Role)...");

    // 1. Sessions
    const { count: sessions, error: sErr } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true });
    if (sErr) console.error("Sessions Error:", sErr);
    else console.log(`✅ Sessions Found: ${sessions}`);

    // 2. Events
    const { count: events, error: eErr } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true });
    if (eErr) console.error("Events Error:", eErr);
    else console.log(`✅ Events Found: ${events}`);

    // 3. Profiles (Admins)
    const { data: admins } = await supabase.from('profiles').select('email').eq('is_admin', true);
    console.log("✅ Admins Found:", admins ? admins.length : 0);
}

checkData();
