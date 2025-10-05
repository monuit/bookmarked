import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) return Response.json({ error: 'Instagram env missing' }, { status: 500 });

    // Exchange code for short-lived token
    const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok) return Response.json({ error: tokenData?.error_message || 'Token exchange failed' }, { status: 500 });

    const { access_token, user_id } = tokenData;

    // Exchange for long-lived token
    const longResp = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(access_token)}`);
    const longData = await longResp.json();
    const longToken = longData?.access_token || access_token;

    await sql(`
      CREATE TABLE IF NOT EXISTS instagram_tokens (
        user_id TEXT PRIMARY KEY,
        ig_user_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await sql(
      `INSERT INTO instagram_tokens (user_id, ig_user_id, access_token, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET access_token = EXCLUDED.access_token, ig_user_id = EXCLUDED.ig_user_id, updated_at = NOW()`,
      [session.user.id, String(user_id), longToken]
    );

    const close = process.env.MOBILE_OAUTH_CLOSE_URL;
    if (close) {
      return Response.redirect(close, 302);
    }
    return Response.json({ success: true });
  } catch (e) {
    console.error('Instagram callback error', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
