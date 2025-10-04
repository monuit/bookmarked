import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tiktokUrl } = body;

    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
      return Response.json({ error: "Please provide a valid TikTok URL" }, { status: 400 });
    }

    // Scrape the TikTok page to get video information
    const scrapeResponse = await fetch('/integrations/web-scraping/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: tiktokUrl,
        getText: true
      })
    });

    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape TikTok URL');
    }

    const scrapedText = await scrapeResponse.text();
    
    // Extract video title and description from the scraped content
    // TikTok pages usually have title tags and meta descriptions
    const titleMatch = scrapedText.match(/<title>(.*?)<\/title>/);
    const descriptionMatch = scrapedText.match(/<meta name="description" content="(.*?)"/);
    
    let title = "TikTok Video";
    let description = "";
    
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(' | TikTok', '').trim();
    }
    
    if (descriptionMatch && descriptionMatch[1]) {
      description = descriptionMatch[1].trim();
    }

    // Create bookmark with extracted information
    const [bookmark] = await sql(`
      INSERT INTO bookmarks (
        user_id, title, url, description, 
        source_platform, content_type, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [
      session.user.id,
      title,
      tiktokUrl,
      description,
      'tiktok',
      'video'
    ]);

    // Add to AI processing queue for categorization
    await sql(`
      INSERT INTO ai_processing_queue (bookmark_id, status, priority, created_at)
      VALUES ($1, 'pending', 1, NOW())
    `, [bookmark.id]);

    return Response.json({ 
      success: true, 
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description
      }
    });

  } catch (error) {
    console.error('Error importing TikTok:', error);
    return Response.json({ 
      error: "Failed to import TikTok video. Please check the URL and try again." 
    }, { status: 500 });
  }
}