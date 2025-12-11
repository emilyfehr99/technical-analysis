
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

async function listUsers() {
    console.log("🔍 Listing All Profiles...");

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, is_admin, tier, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach(p => {
        const adminBadge = p.is_admin ? " [ADMIN] 👑" : "";
        console.log(`- ${p.email} (${p.id}) ${adminBadge}`);
    });
}

listUsers();
