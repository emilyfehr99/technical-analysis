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

        // Use absolute URL for Stripe
        const logoUrl = `${host}/logo.png`;

        if (plan === 'monthly') {
            priceData = {
                currency: 'usd', // Reverted to USD
                product_data: {
                    name: 'Kairos.AI Institutional - Monthly',
                    description: 'Unlimited AI Analysis, Advanced Patterns, Risk Engine',
                    images: [logoUrl],
                },
                unit_amount: 2999, // $29.99 USD
                recurring: {
                    interval: 'month',
                },
            };
        } else if (plan === 'annual') {
            priceData = {
                currency: 'usd', // Reverted to USD
                product_data: {
                    name: 'Kairos.AI Institutional - Annual',
                    description: 'Unlimited AI Analysis (Save 30%)',
                    images: [logoUrl],
                },
                unit_amount: 24999, // $249.99 USD
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
            billing_address_collection: 'required', // Enforce billing address
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
