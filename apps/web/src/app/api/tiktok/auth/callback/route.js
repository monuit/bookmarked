import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    if (!clientKey || !clientSecret) {
      return Response.json({ error: 'TikTok credentials missing' }, { status: 500 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return Response.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const env = process.env.ENV || 'development';
    const redirectMap = {
      development: process.env.TIKTOK_REDIRECT_URI_DEV,
      staging: process.env.TIKTOK_REDIRECT_URI_STAGING,
      production: process.env.TIKTOK_REDIRECT_URI_PROD,
    };
    const redirectUri = redirectMap[env];

    const body = new URLSearchParams();
    body.set('client_key', clientKey);
    body.set('client_secret', clientSecret);
    body.set('code', code);
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', redirectUri);

    const tokenResp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokenData = await tokenResp.json();
    if (!tokenResp.ok) {
      return Response.json({ error: tokenData?.error_description || 'Failed to exchange token' }, { status: 500 });
    }

    const {
      access_token,
      refresh_token,
      open_id,
      scope,
      expires_in,
      refresh_expires_in,
    } = tokenData;

    // Associate tokens with the currently signed-in user session
    // This route is commonly called from an authenticated flow; we use a service token table keyed later.
    // Upsert into a tokens table (create if absent)
    await sql(`
      CREATE TABLE IF NOT EXISTS tiktok_tokens (
        user_id TEXT NOT NULL,
        open_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        scopes TEXT,
        expires_at TIMESTAMP,
        refresh_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id)
      )
    `);

    const userId = session.user.id;

    const expiresAt = new Date(Date.now() + (expires_in ?? 0) * 1000);
    const refreshExpiresAt = new Date(Date.now() + (refresh_expires_in ?? 0) * 1000);

    await sql(
      `INSERT INTO tiktok_tokens (user_id, open_id, access_token, refresh_token, scopes, expires_at, refresh_expires_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         open_id = EXCLUDED.open_id,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         scopes = EXCLUDED.scopes,
         expires_at = EXCLUDED.expires_at,
         refresh_expires_at = EXCLUDED.refresh_expires_at,
         updated_at = NOW()`,
      [userId, open_id, access_token, refresh_token, scope, expiresAt, refreshExpiresAt]
    );

    return Response.json({ success: true });
  } catch (e) {
    console.error('TikTok callback error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
