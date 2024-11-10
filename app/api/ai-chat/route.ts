import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/server';

// Types
interface ChatResponse {
  content: string;
}

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const SYSTEM_MESSAGE = `
You are a helpful AI assistant. Your task is to provide informative and engaging responses to user queries about music.
Be concise, accurate, and helpful in your responses.
`;

// Helper functions
async function getGPTResponse(prompt: string): Promise<ChatResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: prompt }
      ],
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response from GPT');
    }

    return { content: completion.choices[0].message.content };
  } catch (error) {
    console.error('GPT response error:', error);
    throw new Error('Failed to get response');
  }
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
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Set up streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process response
    (async () => {
      try {
        const response = await getGPTResponse(prompt);
        await writer.write(
          new TextEncoder().encode(
            `data: ${JSON.stringify(response)}\n\n`
          )
        );
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