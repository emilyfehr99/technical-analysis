// scripts/inspect_events.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    const { data, error } = await supabase
        .from('analytics_events')
        .select('event_name'); // distinct not directly supported in simple select, we'll process in JS

    if (error) {
        console.error('Error:', error);
        return;
    }

    const events = [...new Set(data.map(d => d.event_name))];
    console.log('Distinct Event Names:', events);
}

inspect();
