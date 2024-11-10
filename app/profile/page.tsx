import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOut from "@/components/sign-out";
import ConnectSpotify from "@/components/connect-spotify";
import DisconnectSpotify from "@/components/disconnect-spotify";
import { headers } from 'next/headers';

export default async function Profile() {
  const supabase = await createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get Spotify connection status
  const { data: spotifyConnection, error: connectionError } = await supabase
    .from('user_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'spotify')
    .single();

  if (connectionError && connectionError.code !== 'PGRST116') {
    console.error('Error fetching Spotify connection:', connectionError);
  }

  const isSpotifyConnected = !!spotifyConnection?.access_token;
  
  // Get URL params for error/success messages using searchParams
  const searchParams = new URLSearchParams((await headers()).get('next-url')?.split('?')[1] || '');
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <SignOut />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error === 'spotify_auth_failed' && 'Failed to connect your Spotify account. Please try again.'}
          {error === 'token_exchange_failed' && 'Failed to complete Spotify authentication. Please try again.'}
          {error === 'database_error' && 'Failed to save your Spotify connection. Please try again.'}
          {error === 'invalid_state' && 'Invalid authentication state. Please try again.'}
          {error === 'profile_fetch_failed' && 'Failed to fetch Spotify profile. Please try again.'}
        </div>
      )}

      {success === 'spotify_connected' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Successfully connected your Spotify account!
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Spotify Connection */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Spotify Connection</h2>
          {isSpotifyConnected && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          )}
        </div>
        
        {isSpotifyConnected ? (
          <div>
            <p className="text-sm text-gray-600">
              Connected as: {spotifyConnection.profile_data?.display_name}
            </p>
            <DisconnectSpotify />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Not Connected: Connect your Spotify account to start creating AI-powered playlists.
            </p>
            <ConnectSpotify />
          </div>
        )}
      </div>
    </div>
  );
}