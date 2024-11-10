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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <SignOut />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error === 'spotify_auth_failed' && 'Failed to connect your Spotify account'}
                  {error === 'token_exchange_failed' && 'Failed to complete Spotify authentication'}
                  {error === 'database_error' && 'Failed to save your Spotify connection'}
                  {error === 'invalid_state' && 'Invalid authentication state'}
                  {error === 'profile_fetch_failed' && 'Failed to fetch Spotify profile'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {success === 'spotify_connected' && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Successfully connected your Spotify account!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Spotify Connection */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Spotify Connection</h2>
              {isSpotifyConnected && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              )}
            </div>
            
            {isSpotifyConnected ? (
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={spotifyConnection.profile_data?.images?.[0]?.url || '/spotify-icon.png'} 
                    alt="Spotify Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {spotifyConnection.profile_data?.display_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Spotify Account
                    </p>
                  </div>
                </div>
                <DisconnectSpotify />
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Connect your Spotify account to start creating AI-powered playlists
                </p>
                <div className="mt-4">
                  <ConnectSpotify />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}