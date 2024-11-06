import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/server';

// Types
interface SongRecommendation {
  title: string;
  artist: string;
}

interface Recommendations {
  recommendations: SongRecommendation[];
}

interface SpotifyTrackResponse {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{
        name: string;
      }>;
    }>;
  };
}

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const SYSTEM_MESSAGE = `
You are a Spotify playlist curator. Your task is to analyze user prompts and generate song recommendations. 
Always return a JSON array containing exactly 5 song recommendations. Each song must include "title" and "artist" fields.

Example format:
{
  "recommendations": [
    {
      "title": "song_title",
      "artist": "artist_name"
    }
  ]
}

Rules:
- Return only the JSON object without any other text
- Include full artist names (no abbreviations)
- Include exact song titles as they would appear on Spotify
- Do not include additional commentary or explanations
- Do not include song descriptions or reasons for recommendations
- Ensure consistent JSON formatting
- Must return exactly 15 songs, no more and no less
`;

// Helper functions
async function getGPTRecommendations(prompt: string): Promise<Recommendations> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "user", content: prompt }
    ],
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const cleaned = content.replace(/```json|```/g, '');
  return JSON.parse(cleaned);
}

async function getTrackIds(recommendations: Recommendations, authToken: string): Promise<string[]> {
  const trackIds: string[] = [];
  const baseUrl = "https://api.spotify.com/v1/search";

  for (const song of recommendations.recommendations) {
    const query = `${song.title} ${song.artist}`;
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '1'
    });

    try {
      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.error(`Error searching for track: ${response.statusText}`);
        continue;
      }

      const data: SpotifyTrackResponse = await response.json();
      
      if (data.tracks.items.length > 0) {
        trackIds.push(data.tracks.items[0].id);
      } else {
        console.log(`No track found for ${song.title} by ${song.artist}`);
      }
    } catch (error) {
      console.error(`Error searching for ${song.title} by ${song.artist}:`, error);
    }
  }

  return trackIds;
}

// Main route handler
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request data
    const { prompt, spotifyToken } = await req.json();
    
    if (!prompt || !spotifyToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Set up streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process recommendations
    (async () => {
      try {
        // Get GPT recommendations
        const recommendations = await getGPTRecommendations(prompt);
        
        // Stream GPT response
        await writer.write(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ content: 'Generating recommendations...' })}\n\n`
          )
        );

        // Get Spotify track IDs
        const trackIds = await getTrackIds(recommendations, spotifyToken);

        if (trackIds.length === 0) {
          await writer.write(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: 'No tracks found' })}\n\n`
            )
          );
        } else {
          // Send final response
          await writer.write(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ trackIds })}\n\n`
            )
          );
        }
      } catch (error) {
        console.error('Processing error:', error);
        await writer.write(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: 'Processing error' })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET method for testing/health check
export async function GET() {
  return NextResponse.json({ status: 'healthy' });
}