import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('Missing required environment variables');
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL));
    }

    const state = Buffer.from(crypto.randomUUID() + Date.now().toString()).toString('base64');
    const cookieStore = await cookies();
    cookieStore.set('spotify_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      scope: [
        'user-read-email',
        'user-read-private',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-library-read',
        'user-library-modify'
      ].join(' '),
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/spotify-auth/next/callback`,
      state,
      show_dialog: 'true'
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/profile?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL));
  }
}