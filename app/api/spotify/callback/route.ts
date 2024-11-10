import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/profile?error=spotify_connection_failed', process.env.NEXT_PUBLIC_APP_URL));
  }

  const supabase = await createClient();
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    // Get Spotify user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // Update user's profile in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: state, // This is the user ID we passed as state
        spotify_connected: true,
        spotify_display_name: profile.display_name,
        spotify_email: profile.email,
        updated_at: new Date().toISOString(),
      });

    if (updateError) throw updateError;

    return NextResponse.redirect(new URL('/profile?success=spotify_connected', process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error('Spotify connection error:', error);
    return NextResponse.redirect(new URL('/profile?error=spotify_connection_failed', process.env.NEXT_PUBLIC_APP_URL));
  }
} 