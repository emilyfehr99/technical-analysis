import { supabase } from './supabaseClient';

// Store session state in memory
let currentSessionId: string | null = null;
let heartbeatInterval: any = null;

export const Analytics = {
    // 1. Start a Session (Call on App Mount)
    async initSession() {
        if (currentSessionId) return; // Already initialized

        try {
            // Get User info (if any)
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            // Get basic device info
            const userAgent = navigator.userAgent;

            // Insert Session
            const { data, error } = await supabase
                .from('analytics_sessions')
                .insert({
                    user_id: userId,
                    user_agent: userAgent,
                    ip_address: null, // IP is better set by Postgres trigger or edge function, but we'll leave null for client insert
                    started_at: new Date().toISOString(),
                    last_seen_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (error) {
                console.error('Analytics: Failed to start session', error);
                return;
            }

            if (data) {
                currentSessionId = data.id;
                console.log('Analytics: Session Started', currentSessionId);
                this.startHeartbeat();
            }
        } catch (e) {
            console.error('Analytics: Init Error', e);
        }
    },

    // 2. Track "Page View" (Virtual)
    async trackPageView(path: string) {
        if (!currentSessionId) await this.initSession();
        if (!currentSessionId) return;

        try {
            await supabase.from('analytics_page_views').insert({
                session_id: currentSessionId,
                path: path,
                viewed_at: new Date().toISOString()
            });
        } catch (e) {
            // Fail silently
        }
    },

    // 3. Heartbeat (Update last_seen_at every minute)
    startHeartbeat() {
        if (heartbeatInterval) clearInterval(heartbeatInterval);

        heartbeatInterval = setInterval(async () => {
            if (!currentSessionId) return;

            await supabase
                .from('analytics_sessions')
                .update({ last_seen_at: new Date().toISOString() })
                .eq('id', currentSessionId);

        }, 60 * 1000); // 1 minute
    }
};
