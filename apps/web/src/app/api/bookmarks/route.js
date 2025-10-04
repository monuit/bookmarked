import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = `
      SELECT 
        b.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM bookmarks b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = $1
    `;
    let params = [session.user.id];
    let paramIndex = 2;

    if (search) {
      query += ` AND (LOWER(b.title) LIKE LOWER($${paramIndex}) OR LOWER(b.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== 'all') {
      query += ` AND b.category_id = $${paramIndex}`;
      params.push(parseInt(category));
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const bookmarks = await sql(query, params);

    // Transform the data to include category info
    const transformedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      category: bookmark.category_name ? {
        id: bookmark.category_id,
        name: bookmark.category_name,
        color: bookmark.category_color,
        icon: bookmark.category_icon
      } : null
    }));

    return Response.json({ bookmarks: transformedBookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      url, 
      description, 
      sourcePlatform, 
      contentType, 
      thumbnailUrl,
      latitude,
      longitude,
      locationName,
      metadata 
    } = body;

    if (!title || !url) {
      return Response.json({ error: "Title and URL are required" }, { status: 400 });
    }

    // Insert bookmark
    const [bookmark] = await sql(`
      INSERT INTO bookmarks (
        user_id, title, url, description, source_platform, 
        content_type, thumbnail_url, latitude, longitude, 
        location_name, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      session.user.id,
      title,
      url,
      description || null,
      sourcePlatform || null,
      contentType || null,
      thumbnailUrl || null,
      latitude || null,
      longitude || null,
      locationName || null,
      metadata || {}
    ]);

    // Add to AI processing queue
    await sql(`
      INSERT INTO ai_processing_queue (bookmark_id)
      VALUES ($1)
    `, [bookmark.id]);

    return Response.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}