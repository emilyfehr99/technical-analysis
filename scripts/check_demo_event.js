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

async function checkDemo() {
    console.log("🔍 Checking for 'click_demo_mode' events...");

    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_name', 'click_demo_mode');

    if (error) console.error("❌ Error:", error);
    else {
        console.log(`✅ Found ${data.length} demo click events.`);
        if (data.length > 0) console.log(data[0]);
    }
}

checkDemo();
