import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { refreshSpotifyToken } from "@/utils/spotify";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Spotify connection
    const { data: spotifyConnection, error: connectionError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'spotify')
      .single();

    if (!spotifyConnection?.access_token) {
      return NextResponse.json(
        { error: 'Spotify not connected' },
        { status: 400 }
      );
    }

    const { name, description, tracks } = await request.json();

    if (!name || !tracks?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let accessToken = spotifyConnection.access_token;

    // Get user's Spotify ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (userResponse.status === 401) {
      accessToken = await refreshSpotifyToken(user.id);
    }

    const userData = await userResponse.json();

    // Create empty playlist
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          public: false,
        }),
      }
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to create playlist');
    }

    const playlist = await playlistResponse.json();

    // Add tracks to playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: tracks.map((trackId: string) => `spotify:track:${trackId}`),
        }),
      }
    );

    if (!addTracksResponse.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    return NextResponse.json({ success: true, playlist });
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
} 