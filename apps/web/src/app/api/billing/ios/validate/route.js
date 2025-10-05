import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

const APPLE_PROD = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

async function verifyAppleReceipt(receiptData, useSandbox) {
  const body = {
    'receipt-data': receiptData,
    password: process.env.APPLE_IAP_SHARED_SECRET,
    'exclude-old-transactions': true,
  };
  const endpoint = useSandbox ? APPLE_SANDBOX : APPLE_PROD;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  return data;
}

function parseLatestEntitlement(receipt) {
  const latest = receipt?.latest_receipt_info;
  if (!Array.isArray(latest) || latest.length === 0) return null;
  // pick the most recent
  const sorted = latest
    .slice()
    .sort((a, b) => Number(b.expires_date_ms || '0') - Number(a.expires_date_ms || '0'));
  const item = sorted[0];
  return {
    productId: item.product_id,
    expiresAt: item.expires_date_ms ? new Date(Number(item.expires_date_ms)) : null,
    originalTransactionId: item.original_transaction_id,
  };
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiptData } = await request.json();
    if (!receiptData) return Response.json({ error: 'Missing receiptData' }, { status: 400 });
    if (!process.env.APPLE_IAP_SHARED_SECRET)
      return Response.json({ error: 'Missing Apple shared secret' }, { status: 500 });

    // First try production, fallback to sandbox on 21007
    let result = await verifyAppleReceipt(receiptData, false);
    if (result?.status === 21007) {
      result = await verifyAppleReceipt(receiptData, true);
    }
    if (result?.status !== 0) {
      return Response.json({ error: 'Invalid receipt', status: result?.status }, { status: 400 });
    }

    const ent = parseLatestEntitlement(result);
    if (!ent) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    await sql(`
      CREATE TABLE IF NOT EXISTS entitlements (
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        product_id TEXT NOT NULL,
        expires_at TIMESTAMP NULL,
        original_transaction_id TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, platform)
      )
    `);

    await sql(
      `INSERT INTO entitlements (user_id, platform, product_id, expires_at, original_transaction_id, updated_at)
       VALUES ($1, 'ios', $2, $3, $4, NOW())
       ON CONFLICT (user_id, platform) DO UPDATE SET
         product_id = EXCLUDED.product_id,
         expires_at = EXCLUDED.expires_at,
         original_transaction_id = EXCLUDED.original_transaction_id,
         updated_at = NOW()`,
      [session.user.id, ent.productId, ent.expiresAt, ent.originalTransactionId]
    );

    return Response.json({ success: true, entitlement: ent });
  } catch (e) {
    console.error('iOS receipt validation error', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
