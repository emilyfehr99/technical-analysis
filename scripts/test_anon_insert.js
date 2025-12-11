import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// CRITICAL: Use ANON KEY, not Service Role
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Anon Keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnonInsert() {
    console.log("🕵️ Testing Anonymous Insert (Simulating Browser)...");

    const { data, error } = await supabase
        .from('analytics_sessions')
        .insert({
            user_agent: 'NodeJS Anon Test',
            started_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error("❌ Anon Insert FAILED (RLS Issue):", error);
    } else {
        console.log("✅ Anon Insert SUCCESS:", data);
    }
}

testAnonInsert();
