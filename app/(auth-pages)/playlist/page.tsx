import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from 'next/headers';
import { ReloadButton } from '@/components/ReloadButton';
import { AnimatedPlaylistGrid } from '@/components/AnimatedPlaylistGrid';
import { refreshAndStoreSpotifyToken } from '@/utils/spotify';

async function refreshTokenOnLoad(userId: string, currentToken: string) {
  try {
    const newToken = await refreshAndStoreSpotifyToken(userId);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token on load:', error);
    return currentToken;
  }
}

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks: {
    total: number;
  };
}

async function getSpotifyPlaylists(accessToken: string, userId: string): Promise<Playlist[]> {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Token expired, refresh it
    const newToken = await refreshAndStoreSpotifyToken(userId);
    return getSpotifyPlaylists(newToken, userId);
  }

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  const data = await response.json();
  return data.items;
}

export default async function PlaylistPage() {
  const supabase = await createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get Spotify connection
  const { data: spotifyConnection, error: connectionError } = await supabase
    .from('user_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'spotify')
    .single();

  if (!spotifyConnection?.access_token) {
    redirect('/profile?error=spotify_not_connected');
  }

  // Refresh token on page load
  const accessToken = await refreshTokenOnLoad(user.id, spotifyConnection.access_token);

  let playlists: Playlist[] = [];
  let error = null;

  try {
    playlists = await getSpotifyPlaylists(accessToken, user.id);
  } catch (e) {
    error = 'Failed to load playlists';
    console.error('Error fetching playlists:', e);
  }

  // Get URL params for error/success messages
  const searchParams = new URLSearchParams((await headers()).get('next-url')?.split('?')[1] || '');
  const queryError = searchParams.get('error');
  const success = searchParams.get('success');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 dark:bg-gray-900 shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Your Playlists
              </h1>
              <ReloadButton />
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {(error || queryError) && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 mb-8">
            <div className="flex">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error || queryError}
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 mb-8">
            <div className="flex">
              <div className="text-sm text-green-700 dark:text-green-200">
                {success}
              </div>
            </div>
          </div>
        )}

        {/* Replace the existing grid with the animated one */}
        <AnimatedPlaylistGrid 
          playlists={playlists} 
          key={Date.now()} 
        />

        {/* Empty State */}
        {playlists.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No playlists found. Start creating some!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}