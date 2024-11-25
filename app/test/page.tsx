'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

interface Song {
  title: string;
  artist: string;
}

interface PlaylistResponse {
  url: string;
}

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getSpotifyToken = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        const { data: spotifyConnection, error: connectionError } = await supabase
          .from('user_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'spotify')
          .single();

        if (connectionError || !spotifyConnection?.access_token) {
          throw new Error('Spotify not connected');
        }

        setAccessToken(spotifyConnection.access_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get Spotify token');
      }
    };

    getSpotifyToken();
  }, []);

  const generateRecommendations = async () => {
    if (!accessToken) {
      setError('No Spotify access token available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          auth_token: accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get recommendations: ${errorData}`);
      }

      const tracks = await response.json();
      if (!Array.isArray(tracks)) {
        throw new Error('Invalid response format from server');
      }

      setTrackIds(tracks);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!accessToken) {
      setError('No Spotify access token available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          track_ids: trackIds,
          title: `AI Generated Playlist: ${prompt}`,
          description: `Generated from prompt: ${prompt}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create playlist: ${errorData}`);
      }

      const playlistUrl = await response.text();
      setPlaylistUrl(playlistUrl);

    } catch (err) {
      console.error('Playlist creation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Test AI Playlist Generator</h1>
      
      {!accessToken && (
        <div className="text-red-500 p-2 border border-red-300 rounded-md mb-4">
          Please connect your Spotify account first
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Enter your prompt:
          </label>
          <textarea
            className="w-full p-2 border rounded-md"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g., Create a playlist for a summer beach party"
          />
        </div>

        <div className="space-x-4">
          <button
            onClick={generateRecommendations}
            disabled={loading || !prompt}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Recommendations'}
          </button>

          <button
            onClick={createPlaylist}
            disabled={loading || trackIds.length === 0}
            className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Playlist'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 p-2 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {trackIds.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Generated Track IDs:</h2>
            <pre className="bg-black text-white p-4 rounded-md overflow-x-auto">
              {JSON.stringify(trackIds, null, 2)}
            </pre>
          </div>
        )}

        {playlistUrl && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Playlist Created!</h2>
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Open Playlist in Spotify
            </a>
          </div>
        )}
      </div>
    </div>
  );
}