import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) {
      throw new Error('Missing SPOTIFY_CLIENT_ID environment variable');
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('Missing APP_URL environment variable');
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Supabase auth error:', userError);
      return NextResponse.redirect(
        new URL('/sign-in?error=auth_error', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/sign-in?error=not_authenticated', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;
    
    // Generate a more secure state
    const state = Buffer.from(crypto.randomUUID() + Date.now().toString()).toString('base64');

    // Set cookie with stricter options
    const cookieStore = await cookies();
    cookieStore.set('spotify_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    // Extended scope for better functionality
    const scope = [
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-library-modify'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state,
      show_dialog: 'true' // Force showing the auth dialog
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  } catch (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.redirect(
      new URL('/profile?error=spotify_auth_failed&details=' + encodeURIComponent, 
      process.env.NEXT_PUBLIC_APP_URL)
    );
  }
} 