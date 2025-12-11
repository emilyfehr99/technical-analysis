
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Service Role Key or URL.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const email = process.argv[2];

async function checkUser() {
    console.log(`Checking status for: ${email}`);

    // 1. Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error("List Error:", error); return; }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.error("User not found in Auth table!");
        return;
    }

    console.log(`Auth User Found: ${user.id}`);
    console.log(`Email Confirmed: ${user.email_confirmed_at}`);

    // 2. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("Profile Fetch Error:", profileError);
    } else {
        console.log("Profile Data:", profile);
    }
}

checkUser();
