import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { updateSession } from "@/utils/supabase/middleware";
import { refreshAndStoreSpotifyToken } from "@/utils/spotify";
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Handle authentication session
  const authResponse = await updateSession(request);
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Force refresh token on each middleware call
    if (user?.id) {
      await refreshAndStoreSpotifyToken(user.id, true);
    }
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
  }

  return authResponse;
}

export const config = {
  matcher: [
    '/home/:path*',
    '/profile/:path*',
    '/playlist/:path*',
    '/api/spotify/:path*',
    '/api/ai-chat/:path*'
  ],
};
