import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle Spotify auth errors
    if (error) {
      console.error('Spotify auth error:', error);
      return NextResponse.redirect(
        new URL(`/profile?error=spotify_${error}`, process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Validate state to prevent CSRF
    const cookieStore = await cookies();
    const storedState = cookieStore.get('spotify_auth_state')?.value;
    
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL('/profile?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/profile?error=missing_code', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange error:', error);
      return NextResponse.redirect(
        new URL('/profile?error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user's Spotify profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Profile fetch error:', await profileResponse.text());
      return NextResponse.redirect(
        new URL('/profile?error=profile_fetch_failed', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const profileData = await profileResponse.json();

    // Store tokens in Supabase
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('user_connections')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        provider: 'spotify',
        provider_id: profileData.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        profile_data: profileData
      });

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.redirect(
        new URL('/profile?error=database_error', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Clear the state cookie
    cookieStore.delete('spotify_auth_state');

    return NextResponse.redirect(
      new URL('/profile?success=spotify_connected', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/profile?error=callback_failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
} 
