import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tokens for this user
    const [row] = await sql(`SELECT * FROM tiktok_tokens WHERE user_id = $1`, [
      session.user.id,
    ]);
    if (!row) {
      return Response.json({ error: 'Not connected to TikTok' }, { status: 400 });
    }

    // Placeholder: TikTok "bookmarks" are not publicly available via API.
    // As an alternative, pull user's own public videos if we have scope video.list.
    // In future: extend with Instagram, or listen to webhook-like flows if available.
    const listResp = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,share_url,title,cover_image_url',
      {
        headers: { Authorization: `Bearer ${row.access_token}` },
      }
    );
    if (!listResp.ok) {
      const err = await listResp.json().catch(() => ({}));
      return Response.json({ error: err?.message || 'Failed to fetch TikTok videos' }, { status: 500 });
    }
    const data = await listResp.json();
    const items = data?.data?.videos ?? [];

    let imported = 0;
    for (const v of items) {
      const shareUrl = v.share_url || null;
      if (!shareUrl) continue;
      const title = v.title || 'TikTok Video';
      // Insert if not exists for this user
      await sql(
        `INSERT INTO bookmarks (user_id, title, url, description, source_platform, content_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [session.user.id, title, shareUrl, '', 'tiktok', 'video']
      );
      imported++;
    }

    return Response.json({ success: true, imported });
  } catch (e) {
    console.error('TikTok sync error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
