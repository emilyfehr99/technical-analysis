import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    console.log("URL:", supabaseUrl ? "Found" : "Missing");
    console.log("Key:", supabaseKey ? "Found" : "Missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    const ADMIN_EMAIL = '8emilyfehr@gmail.com';
    console.log("Connecting to Supabase...");

    // 1. Total Signups (Profiles table is standard)
    // Check if profiles table exists by selecting 1
    const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('email', ADMIN_EMAIL);

    if (profileError) {
        console.error("Error accessing 'profiles':", profileError.message);
        // Try 'users' matching auth? Usually can't query auth.users directly via client unless service role
    }

    // 2. Paid Users (Check for tier or subscription columns)
    let paidCount = 0;
    try {
        const { data: paidUsers, error: paidError } = await supabase
            .from('profiles')
            .select('*')
            .neq('email', ADMIN_EMAIL)
            .neq('tier', 'free')
            .neq('tier', 'basic') // Assuming 'free' or 'basic' are defaults
            .not('tier', 'is', null);

        if (!paidError && paidUsers) {
            paidCount = paidUsers.length;
        } else if (paidError) {
            // Ignore column error if tier doesn't exist
        }
    } catch (e) { }

    // 3. Check for specific 'subscriptions' table?
    const { count: subCount, error: subError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

    // 4. Waitlist
    const { count: waitlistCount, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

    console.log("\n--- 📊 GROWTH SNAPSHOT ---");
    if (!profileError) console.log(`✅ Total Profiles (Signups): ${profileCount || 0}`);
    if (subCount !== null && !subError) console.log(`💰 Active Subscriptions: ${subCount}`);
    else console.log(`💰 Paid Users (via Profile Tier): ${paidCount}`);

    if (waitlistCount !== null && !waitlistError) console.log(`📝 Waitlist Signups: ${waitlistCount}`);

    // Recent Activity
    if (!profileError) {
        const { data: recent } = await supabase
            .from('profiles')
            .select('email, created_at, tier')
            .neq('email', ADMIN_EMAIL) // Filter out Admin
            .order('created_at', { ascending: false })
            .limit(5);

        if (recent && recent.length > 0) {
            console.log("\n--- 🕒 RECENT SIGNUPS ---");
            recent.forEach(u => {
                console.log(`- ${u.email || 'Hidden Email'} [${u.tier || 'Free'}] (${new Date(u.created_at).toLocaleDateString()})`);
            });
        } else {
            console.log("\n(No recent signups found)");
        }
    }
}

checkStats();
