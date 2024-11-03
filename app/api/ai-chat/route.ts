import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGE = "You are a music recommendation assistant with extensive knowledge of songs across various genres and eras. Your role is to always provide song recommendations based on the user's input. Offer detailed explanations about why you're recommending each song.";

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { prompt } = await req.json();
    
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: prompt }
      ],
      stream: true,
    });

    (async () => {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            const data = `data: ${JSON.stringify({ content })}\n\n`;
            await writer.write(new TextEncoder().encode(data));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
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
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 