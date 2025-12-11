import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local and .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verify keys exist
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Keys in .env.local");
    console.error("Available Keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('VITE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    // 1. Try to Insert (Test RLS)
    console.log("Attempting test insert...");
    const { error: insertError } = await supabase.from('analytics_events').insert({
        event_name: 'test_event_backend',
        properties: { source: 'cli_verification' }
    });

    if (insertError) {
        console.error("❌ Insert Failed! (Likely RLS or Table Missing)", insertError);
    } else {
        console.log("✅ Insert Success! RLS is working.");
    }

    // 2. Read Events
    console.log("Fetching recent analytics events...");

    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(10);

    if (error) console.error("Error fetching events:", error);
    else {
        if (!data || data.length === 0) console.log("No events found.");
        else {
            console.log(`Found ${data.length} recent events:`);
            console.table(data.map(e => ({
                Time: new Date(e.occurred_at).toLocaleTimeString(),
                Event: e.event_name,
                Properties: JSON.stringify(e.properties)
            })));
        }
    }

    // 3. Read Sessions
    console.log("Fetching recent sessions...");
    const { data: sessions, error: sessionError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);

    if (sessionError) console.error("Error fetching sessions:", sessionError);
    else {
        if (!sessions || sessions.length === 0) console.log("No sessions found.");
        else {
            console.log(`Found ${sessions.length} recent sessions:`);
            console.table(sessions.map(s => ({
                ID: s.id,
                Time: new Date(s.started_at).toLocaleTimeString(),
                UA: s.user_agent ? s.user_agent.substring(0, 30) + '...' : 'N/A'
            })));
        }
    }
}

inspect();
