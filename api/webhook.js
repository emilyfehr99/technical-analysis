import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let event;

    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_email || session.metadata?.email;
        const plan = session.metadata?.plan || 'premium';

        console.log(`💰 Payment success for: ${email} (${plan})`);

        if (email) {
            // Upgrade User in Supabase
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    tier: 'premium',
                    credits: 999999, // Unlocked
                    updated_at: new Date()
                })
                .eq('email', email);

            if (error) {
                console.error('Failed to upgrade user profile:', error);
            } else {
                console.log('✅ User upgraded successfully');

                // Trigger Discord Notification
                try {
                    const protocol = req.headers['x-forwarded-proto'] || 'http';
                    const host = req.headers.host;
                    const discordApiUrl = `${protocol}://${host}/api/discord`;

                    await fetch(discordApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'PAYMENT_SUCCESS',
                            data: {
                                email: email,
                                plan: plan,
                                amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : '19.00'
                            }
                        })
                    });
                    console.log('🔔 Discord notification sent');
                } catch (notifyError) {
                    console.error('Failed to send Discord notification:', notifyError);
                }
            }
        }
    }

    res.json({ received: true });
}
