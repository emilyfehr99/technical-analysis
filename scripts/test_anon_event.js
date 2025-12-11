import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Anon Keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnonEvent() {
    console.log("🕵️ Testing Anonymous Event Insert...");

    // 1. Create Session first (we know this works now)
    const { data: session, error: sessionError } = await supabase
        .from('analytics_sessions')
        .insert({
            user_agent: 'NodeJS Event Test',
            started_at: new Date().toISOString()
        })
        .select()
        .single();

    if (sessionError) {
        console.error("❌ Session Init Failed:", sessionError);
        return;
    }
    console.log("✅ Session Created:", session.id);

    // 2. Try Event
    const { data: event, error: eventError } = await supabase
        .from('analytics_events')
        .insert({
            session_id: session.id,
            event_name: 'test_demo_click',
            properties: { test: true },
            occurred_at: new Date().toISOString()
        })
        .select()
        .single();

    if (eventError) {
        console.error("❌ Event Insert FAILED:", eventError);
    } else {
        console.log("✅ Event Insert SUCCESS:", event);
    }
}

testAnonEvent();
