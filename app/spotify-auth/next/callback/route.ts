import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('Callback received:', { code: code?.slice(0,5), state, error });

    if (error) {
      throw new Error(`Spotify error: ${error}`);
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('spotify_auth_state')?.value;
    
    if (!state || !storedState || state !== storedState) {
      throw new Error('State mismatch');
    }

    if (!code) {
      throw new Error('Missing code');
    }

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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/spotify-auth/next/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Profile fetch failed');
    }

    const profile = await profileResponse.json();

    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('user_connections')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        provider: 'spotify',
        provider_id: profile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        profile_data: profile
      });

    if (dbError) throw dbError;

    cookieStore.delete('spotify_auth_state');
    return NextResponse.redirect(new URL('/profile?success=true', process.env.NEXT_PUBLIC_APP_URL));
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/profile?error=callback_failed', process.env.NEXT_PUBLIC_APP_URL));
  }
}