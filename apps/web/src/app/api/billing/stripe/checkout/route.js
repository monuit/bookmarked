import Stripe from 'stripe';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return Response.json({ error: 'Stripe key missing' }, { status: 500 });

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  const body = await request.json().catch(() => ({}));
  // If you have predefined price IDs, pass them from client. For now, we can create a Price on the fly for testing.
  const { priceId, mode = 'subscription', successUrl, cancelUrl } = body;

  let price = priceId;
  if (!price) {
    // Create a product/price for testing. In production, set this up in dashboard and send priceId.
    const product = await stripe.products.create({ name: 'Bookmarked Pro (Auto-renew)' });
    const created = await stripe.prices.create({
      unit_amount: 499,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: product.id,
    });
    price = created.id;
  }

  const checkout = await stripe.checkout.sessions.create({
    mode,
    customer_email: session.user.email,
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    success_url: successUrl || `${process.env.PUBLIC_BASE_URL}/account?status=success`,
    cancel_url: cancelUrl || `${process.env.PUBLIC_BASE_URL}/account?status=cancelled`,
  });

  return Response.json({ url: checkout.url });
}
