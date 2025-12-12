import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { plan, email } = req.body;

    // Define host for redirects
    const host = req.headers.origin || 'https://technical-analysis.vercel.app';

    try {
        let priceData = {};

        if (plan === 'monthly') {
            priceData = {
                currency: 'cad', // Changed to CAD
                product_data: {
                    name: 'Kairos.AI Institutional - Monthly',
                    description: 'Unlimited AI Analysis, Advanced Patterns, Risk Engine',
                    // images removed
                },
                unit_amount: 3999, // $39.99 CAD
                recurring: {
                    interval: 'month',
                },
            };
        } else if (plan === 'annual') {
            priceData = {
                currency: 'cad', // Changed to CAD
                product_data: {
                    name: 'Kairos.AI Institutional - Annual',
                    description: 'Unlimited AI Analysis (Save 30%)',
                    // images removed
                },
                unit_amount: 34999, // $349.99 CAD
                recurring: {
                    interval: 'year',
                },
            };
        } else {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: priceData,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true, // Enable coupons
            // automatic_tax: { enabled: true }, // Disabled for Sole Prop
            billing_address_collection: 'auto',
            success_url: `${host}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${host}/?canceled=true`,
            customer_email: email || undefined,
            metadata: {
                plan,
                source: 'technical_analysis_web'
            }
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe Checkout Error:', err);
        res.status(500).json({ error: err.message });
    }
}
