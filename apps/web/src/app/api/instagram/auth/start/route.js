import { auth } from '@/auth';

export async function GET(c) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!clientId || !redirectUri) return Response.json({ error: 'Instagram env missing' }, { status: 500 });

  // Instagram Basic Display API OAuth (long-lived token flow)
  const state = Buffer.from(JSON.stringify({ n: crypto.randomUUID(), t: Date.now() })).toString('base64url');
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'user_profile,user_media');
  url.searchParams.set('state', state);

  return Response.json({ authorizeUrl: url.toString(), state });
}
