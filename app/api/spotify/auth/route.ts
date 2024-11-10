import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const supabase = await createClient();
  
  // Get the user to ensure they're authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL));
  }

  // Generate the Spotify OAuth URL
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;
  const scope = 'user-read-email playlist-modify-public playlist-modify-private';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    scope,
    redirect_uri: redirectUri,
    state: user.id, // Use user ID as state to verify the callback
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
} 