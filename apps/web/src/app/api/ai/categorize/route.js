import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookmarkId } = body;

    if (!bookmarkId) {
      return Response.json({ error: "Bookmark ID is required" }, { status: 400 });
    }

    // Get the bookmark details
    const [bookmark] = await sql(`
      SELECT * FROM bookmarks 
      WHERE id = $1 AND user_id = $2
    `, [bookmarkId, session.user.id]);

    if (!bookmark) {
      return Response.json({ error: "Bookmark not found" }, { status: 404 });
    }

    // Update queue status to processing
    await sql(`
      UPDATE ai_processing_queue 
      SET status = 'processing', processing_started_at = NOW()
      WHERE bookmark_id = $1
    `, [bookmarkId]);

    try {
      // Prepare AI prompt for categorization
      const aiPrompt = `
        Please categorize this bookmark and suggest improvements:
        
        Title: ${bookmark.title}
        URL: ${bookmark.url}
        Description: ${bookmark.description || 'No description'}
        Location: ${bookmark.location_name || 'No location'}
        
        Available categories:
        1. Food & Recipes - Cooking recipes, restaurants, and food content
        2. Travel & Places - Travel destinations, locations, and places to visit  
        3. Shopping - Products, stores, and shopping recommendations
        4. Entertainment - Movies, shows, music, and entertainment content
        5. Education - Learning resources, tutorials, and educational content
        6. Health & Fitness - Health tips, workout routines, and wellness content
        7. Technology - Tech products, tutorials, and technology content
        8. Lifestyle - General lifestyle, home, and personal content
        9. Business - Work, business, and professional content
        10. Uncategorized - Items that don't fit other categories
        
        Please respond with a JSON object containing:
        - category_id: number (1-10 based on the categories above)
        - confidence: number (0.0-1.0)
        - reasoning: string (brief explanation)
        - suggested_description: string (improved description if needed)
        - content_type: string (e.g., "recipe", "location", "product", "article")
      `;

      // Call ChatGPT API for categorization
      const aiResponse = await fetch('/integrations/chat-gpt/conversationgpt4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an AI assistant that categorizes bookmarks accurately and provides helpful suggestions.' },
            { role: 'user', content: aiPrompt }
          ],
          json_schema: {
            name: "bookmark_categorization",
            schema: {
              type: "object",
              properties: {
                category_id: { type: "number" },
                confidence: { type: "number" },
                reasoning: { type: "string" },
                suggested_description: { type: "string" },
                content_type: { type: "string" }
              },
              required: ["category_id", "confidence", "reasoning", "suggested_description", "content_type"],
              additionalProperties: false
            }
          }
        })
      });

      if (!aiResponse.ok) {
        throw new Error('AI categorization failed');
      }

      const aiResult = await aiResponse.json();
      const categorization = JSON.parse(aiResult.choices[0].message.content);

      // Update bookmark with AI categorization
      await sql(`
        UPDATE bookmarks 
        SET 
          category_id = $1,
          content_type = $2,
          description = COALESCE(NULLIF($3, ''), description),
          updated_at = NOW()
        WHERE id = $4
      `, [
        categorization.category_id,
        categorization.content_type,
        categorization.suggested_description !== bookmark.description ? categorization.suggested_description : null,
        bookmarkId
      ]);

      // Mark processing as completed
      await sql(`
        UPDATE ai_processing_queue 
        SET 
          status = 'completed',
          processing_completed_at = NOW()
        WHERE bookmark_id = $1
      `, [bookmarkId]);

      return Response.json({ 
        success: true,
        categorization 
      });

    } catch (aiError) {
      console.error('AI categorization error:', aiError);
      
      // Mark processing as failed
      await sql(`
        UPDATE ai_processing_queue 
        SET 
          status = 'failed',
          error_message = $1,
          retry_count = retry_count + 1
        WHERE bookmark_id = $2
      `, [aiError.message, bookmarkId]);

      return Response.json({ error: "Categorization failed" }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in AI categorization:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}