import OpenAI from 'openai';
import { createClient } from '@vercel/postgres';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ReviewAnalysis {
  summary: string;
  highlights: string[];
  improvements: string[];
}

export async function analyzeReviews(reviews: any[]): Promise<ReviewAnalysis> {
  try {
    const prompt = `
      Analyze these ${reviews.length} reviews for a mobile home park.
      
      Reviews data: ${JSON.stringify(reviews)}
      
      Weighting criteria:
      - Recent reviews (last 6 months) count 2x
      - Focus on objective factors (maintenance, management, safety, amenities)
      - Ignore one-off complaints
      - Consider review rating distribution
      
      Provide:
      1. A concise, factual summary (max 100 words)
      2. 3-5 evidence-based highlights (strengths)
      3. 3-5 actionable areas for improvement
      
      Format response as JSON with keys: summary, highlights, improvements
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an objective analyst specializing in mobile home park reviews. Focus on patterns and verifiable observations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result as ReviewAnalysis;
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    throw error;
  }
}

export async function updateListingReviews(listingId: number, placeId: string) {
  const client = createClient();
  await client.connect();

  try {
    // 1. Fetch Google reviews
    const reviews = await fetchGoogleReviews(placeId); // You'll need to implement this

    // 2. Analyze reviews
    const analysis = await analyzeReviews(reviews.reviews);

    // 3. Update database
    await client.query(`
      UPDATE mhp_listings 
      SET 
        google_rating = $1,
        google_total_reviews = $2,
        review_summary = $3,
        review_highlights = $4,
        review_improvements = $5,
        last_review_sync = NOW()
      WHERE id = $6
    `, [
      reviews.rating,
      reviews.reviews.length,
      analysis.summary,
      analysis.highlights,
      analysis.improvements,
      listingId
    ]);

    return analysis;
  } finally {
    await client.end();
  }
} 