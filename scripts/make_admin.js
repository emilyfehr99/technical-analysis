
import { createClient } from '@supabase/supabase-js';

// Init Supabase (Service Role to bypass RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Service Role Key or URL. Check .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];

if (!email) {
    console.error("Usage: node scripts/make_admin.js <email>");
    process.exit(1);
}

async function grantAdmin() {
    console.log(`Granting Premium Access to: ${email}...`);

    // 1. Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    // Simple find by email (since listUsers allows it or we filter client side for small lists)
    // Actually listUsers returns pages. Better:
    // We can just update 'profiles' directly using a join? No, easiest is to get ID first.

    // Note: 'listUsers' is admin only.
    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("User not found! Has the user signed up yet?");
        return;
    }

    // 2. Confirm Email & Update Profile
    // Update Auth User (Confirm Email)
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true, user_metadata: { email_verified: true } }
    );

    if (authUpdateError) console.error("Error verifying email:", authUpdateError);

    // Update Public Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            tier: 'premium',
            credits: 999999
        })
        .eq('id', user.id);

    if (updateError) {
        console.error("Error updating profile:", updateError);
    } else {
        console.log("Success! User is now Premium/Admin.");
    }
}

grantAdmin();
