import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRaw() {
    console.log("🔍 Inspecting ALL Raw Data (No Time Filters)...");

    const tables = ['analytics_sessions', 'analytics_page_views', 'analytics_events'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) console.error(`❌ ${table}: Error`, error.message);
        else console.log(`✅ ${table}: ${count} total rows`);
    }

    // Check last 5 sessions to clear timezone confusion
    const { data: recent } = await supabase.from('analytics_sessions').select('started_at').order('started_at', { ascending: false }).limit(5);
    if (recent && recent.length) {
        console.log("🕒 Most recent session:", recent[0].started_at);
    } else {
        console.log("🕒 No recent sessions found.");
    }
}

inspectRaw();
