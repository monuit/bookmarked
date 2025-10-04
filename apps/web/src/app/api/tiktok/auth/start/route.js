import { auth } from '@/auth';

export async function GET(c) {
  // Ensure user is signed in
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    return Response.json({ error: 'TikTok client key missing' }, { status: 500 });
  }

  const env = process.env.ENV || 'development';
  const redirectMap = {
    development: process.env.TIKTOK_REDIRECT_URI_DEV,
    staging: process.env.TIKTOK_REDIRECT_URI_STAGING,
    production: process.env.TIKTOK_REDIRECT_URI_PROD,
  };
  const redirectUri = redirectMap[env];
  if (!redirectUri) {
    return Response.json({ error: 'TikTok redirect URI not configured for environment' }, { status: 500 });
  }

  // Basic state protection
  const state = crypto.randomUUID();

  const scopes = [
    // TikTok public scopes; note: there is no official "bookmarks" scope
    'user.info.basic',
    'video.list',
  ];

  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.set('client_key', clientKey);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  // Return URL so native/web can open it. Optionally we could redirect on web
  return Response.json({ authorizeUrl: url.toString(), state });
}
