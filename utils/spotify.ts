import { createClient } from "@/utils/supabase/server";

export async function refreshAndStoreSpotifyToken(userId: string, forceRefresh: boolean = false) {
  const supabase = await createClient();
  
  const { data: spotifyConnection, error: connectionError } = await supabase
    .from('user_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'spotify')
    .single();

  if (connectionError || !spotifyConnection?.refresh_token) {
    console.error('No Spotify connection found:', connectionError);
    return null;
  }

  try {
    const expiresAt = new Date(spotifyConnection.expires_at);
    const now = new Date();
    
    if (forceRefresh || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: spotifyConnection.refresh_token,
        }).toString(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${JSON.stringify(data)}`);
      }

      const { error: updateError } = await supabase
        .from('user_connections')
        .update({ 
          access_token: data.access_token,
          expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString()
        })
        .eq('user_id', userId)
        .eq('provider', 'spotify');

      if (updateError) {
        console.error('Error updating token in database:', updateError);
        throw updateError;
      }

      console.log('Token refreshed successfully');
      return data.access_token;
    }

    return spotifyConnection.access_token;
  } catch (error) {
    console.error('Error in refreshAndStoreSpotifyToken:', error);
    throw error;
  }
}

export async function manualRefreshToken(userId: string) {
  try {
    const newToken = await refreshAndStoreSpotifyToken(userId, true);
    return { success: true, token: newToken };
  } catch (error) {
    console.error('Manual refresh failed:', error);
    return { success: false, error };
  }
}
