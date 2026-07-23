/**
 * POST /api/ai/smart-picks
 * Fast Gemini 2.5 Flash LLM-driven food & restaurant recommendations.
 * Returns structured JSON with reasoning, dish matches, and smart picks.
 */
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userLocation, emirate = 'Dubai', timeOfDay = 'dinner', restaurants = [], query = '' } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Filter candidate restaurants based on emirate / location
    const candidates = restaurants.slice(0, 10).map(r => ({
      id: r.id || r.slug,
      name: r.name,
      emirate: r.emirate || emirate,
      area: r.area || '',
      rating: r.rating || 4.5,
      priceRange: r.priceRange || '$$',
      cuisines: r.cuisines || ['Ethiopian'],
      distanceKm: r._distance ? parseFloat(r._distance.toFixed(1)) : null,
      topDishes: (r.menu || [])
        .flatMap(c => c.items || [])
        .slice(0, 4)
        .map(i => ({ name: i.name, price: i.price, category: i.dishCategory })),
    }));

    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not configured
      return NextResponse.json({
        source: 'local-fallback',
        suggestions: generateLocalSmartPicks(candidates, timeOfDay, query),
      });
    }

    const systemPrompt = `You are an expert Ethiopian & Eritrean food recommendation AI assistant for Habesha Eats in the UAE.
Analyze the user's location (${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : emirate}), time of day (${timeOfDay}), and search intent ("${query}").
Provide 3 to 5 highly relevant smart food suggestions.

Candidate restaurants & top dishes:
${JSON.stringify(candidates, null, 2)}

Respond strictly in valid JSON with this format:
{
  "suggestions": [
    {
      "id": "unique-id",
      "restaurantId": "restaurant-id-or-slug",
      "restaurantName": "Exact Restaurant Name",
      "dishName": "Recommended Dish Name",
      "badge": "AI PICK",
      "title": "Catchy Title",
      "reason": "Why this is recommended (1 short sentence considering location, price, rating, time)",
      "accent": "green|gold|purple|red|blue",
      "estimatedCost": 45
    }
  ]
}`;

    // Call Gemini 2.5 Flash REST API directly (ultra fast, <500ms)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn('[Gemini AI] API error, falling back to heuristic picks:', errText);
      return NextResponse.json({
        source: 'local-fallback',
        suggestions: generateLocalSmartPicks(candidates, timeOfDay, query),
      });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || '{}');

    return NextResponse.json({
      source: 'gemini-2.5-flash',
      suggestions: parsed.suggestions || generateLocalSmartPicks(candidates, timeOfDay, query),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[Gemini AI] SmartPicks Handler Error:', error.message);
    return NextResponse.json({
      source: 'error-fallback',
      suggestions: [],
      error: error.message,
    }, { status: 500 });
  }
}

function generateLocalSmartPicks(candidates, timeOfDay, query) {
  if (!candidates.length) return [];
  const picks = [];
  const sorted = [...candidates].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));

  if (sorted[0]) {
    picks.push({
      id: 'ai-closest',
      restaurantId: sorted[0].id,
      restaurantName: sorted[0].name,
      dishName: sorted[0].topDishes[0]?.name || 'Signature Special',
      badge: 'CLOSEST NEARBY',
      title: `${sorted[0].name}`,
      reason: sorted[0].distanceKm ? `Only ${sorted[0].distanceKm} km from your current location.` : 'Located near your current area.',
      accent: 'green',
      estimatedCost: sorted[0].topDishes[0]?.price || 45,
    });
  }

  const topRated = [...candidates].sort((a, b) => b.rating - a.rating)[0];
  if (topRated && topRated.id !== sorted[0]?.id) {
    picks.push({
      id: 'ai-top-rated',
      restaurantId: topRated.id,
      restaurantName: topRated.name,
      dishName: topRated.topDishes[0]?.name || 'Doro Wot',
      badge: 'TOP RATED',
      title: `${topRated.name}`,
      reason: `Rated ${topRated.rating}★ with traditional authentic spices.`,
      accent: 'gold',
      estimatedCost: topRated.topDishes[0]?.price || 55,
    });
  }

  return picks;
}
