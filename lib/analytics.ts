import { supabase } from './supabaseClient';

// Store session state in memory
let currentSessionId: string | null = null;
let heartbeatInterval: any = null;

export const Analytics = {
    // 1. Start a Session (Call on App Mount)
    async initSession() {
        if (currentSessionId) return; // In-memory check

        // A. Persistence Check (Prevent duplicate session on refresh)
        const storedSession = sessionStorage.getItem('kairos_session_id');
        if (storedSession) {
            currentSessionId = storedSession;
            console.log('Analytics: Resumed Session', currentSessionId);
            this.startHeartbeat();
            return;
        }

        // B. Bot Filter (Exclude Crawlers)
        const userAgent = navigator.userAgent || '';
        const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);
        const isLocal = window.location.hostname === 'localhost';

        // Optional: Block localhost if you strictly want Prod data only
        if (isBot) {
            console.log('Analytics: Bot detected', userAgent);
            // return; // TEMPORARILY DISABLED FOR VERIFICATION
        }

        try {
            // Get User info (if any)
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            // Insert Session
            const { data, error } = await supabase
                .from('analytics_sessions')
                .insert({
                    user_id: userId,
                    user_agent: userAgent,
                    // ip_address is handled by backend or RLS if needed, leaving null for client
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
                sessionStorage.setItem('kairos_session_id', currentSessionId); // Persist
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

    // 2b. Track Custom Event
    async trackEvent(eventName: string, properties: Record<string, any> = {}) {
        if (!currentSessionId) await this.initSession();
        if (!currentSessionId) return;

        try {
            await supabase.from('analytics_events').insert({
                session_id: currentSessionId,
                event_name: eventName,
                properties: properties,
                occurred_at: new Date().toISOString()
            });
            console.log('Analytics: Event Tracked', eventName);
        } catch (e) {
            console.error('Analytics: Track Event Error', e);
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
