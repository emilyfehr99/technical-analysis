import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Use Public Anon Key - simulating the Browser Client
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFix() {
    console.log("🕵️ Verifying Fix: Inserting Session WITH 'ip_address' field...");

    // This specific payload was failing with "Could not find column ip_address"
    const { data, error } = await supabase
        .from('analytics_sessions')
        .insert({
            user_agent: 'Verification Script',
            started_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            ip_address: '127.0.0.1' // This field caused the crash before
        })
        .select()
        .single();

    if (error) {
        console.error("❌ Fix Validation FAILED:", error.message);
    } else {
        console.log("✅ Fix Validation SUCCESS!");
        console.log("   ID:", data.id);
        console.log("   IP:", data.ip_address);
    }
}

verifyFix();
