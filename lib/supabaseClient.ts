
import { createClient } from '@supabase/supabase-js';

// Access Environment Variables safely (Vite vs Node)
const getEnv = (key: string) => {
    // Check for Vite's import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    // Check for Node's process.env
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase Credentials Missing. URL:', supabaseUrl, 'Key Present:', !!supabaseKey);
    // Don't throw here to avoid full white-screen if just one is missing, but auth will fail.
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
