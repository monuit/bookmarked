import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get categories with bookmark counts for the user
    const categories = await sql(`
      SELECT 
        c.*,
        COALESCE(bookmark_counts.count, 0) as bookmark_count
      FROM categories c
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as count
        FROM bookmarks 
        WHERE user_id = $1
        GROUP BY category_id
      ) bookmark_counts ON c.id = bookmark_counts.category_id
      ORDER BY c.name
    `, [session.user.id]);

    return Response.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}