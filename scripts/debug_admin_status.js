
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

const supabase = createClient(supabaseUrl, serviceKey);

async function checkAdmins() {
    console.log("🔍 Verifying Admins...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, is_admin, tier');

    if (error) {
        console.error("Error:", error);
        return;
    }

    const admins = profiles.filter(p => p.is_admin);
    console.log(`Found ${admins.length} Admins.`);
    admins.forEach(a => console.log(`- ${a.email} (${a.id})`));

    if (admins.length === 0) {
        console.log("⚠️ NO ADMINS FOUND! This is why the RPC fails.");
    }

    // Also check if RPC exists (by trying to call it with service role - might fail due to no auth.uid, but check error type)
    console.log("\n🔍 Probing RPC...");
    const { error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');
    console.log("RPC Call Result (Expected Error):", rpcError?.message || "Success?");
}

checkAdmins();
