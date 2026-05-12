
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('Checking Technical Analysis Users...');
  
  // 1. Registered Users (Profiles)
  const { count: profileCount, error: profileError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log(`Total Registered Users (Profiles): ${profileCount}`);
  }

  // 2. IP Tracking (Anonymous Users)
  const { count: ipCount, error: ipError } = await supabase
    .from('ip_tracking')
    .select('*', { count: 'exact', head: true });
  
  if (ipError) {
    console.error('Error fetching IP tracking:', ipError);
  } else {
    console.log(`Total Anonymous IPs tracked: ${ipCount}`);
  }

  // 3. Analytics Events
  const { count: eventCount, error: eventError } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true });
  
  if (eventError) {
    // Analytics table might not exist or be named differently
    console.log('Analytics events table not found or error:', eventError.message);
  } else {
    console.log(`Total Analytics Events: ${eventCount}`);
  }

  // 4. Waitlist (if still exists)
  try {
    const { count: waitlistCount, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
    
    if (!waitlistError) {
        console.log(`Total Waitlist Signups: ${waitlistCount}`);
    }
  } catch (e) {
    // Ignore if table doesn't exist
  }

  // 5. Get some recent profiles
  const { data: recentProfiles, error: recentError } = await supabase
    .from('profiles')
    .select('id, email, tier, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentError && recentProfiles && recentProfiles.length > 0) {
    console.log('\nRecent Registered Users:');
    recentProfiles.forEach(p => {
      console.log(`- ${p.email} (${p.tier}) Joined: ${p.created_at}`);
    });
  }
}

checkUsers();
