'use client';

import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

interface SpotifySearchProps {
  accessToken: string;
  onTrackSelect?: (track: Track) => void;
}

export function SpotifySearch({ accessToken, onTrackSelect }: SpotifySearchProps) {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchSpotify = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchSpotify, 300), []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          placeholder="Search for a song..."
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {searchResults.map((track) => (
            <button
              key={track.id}
              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 border-b last:border-b-0"
              onClick={() => onTrackSelect?.(track)}
            >
              <img
                src={track.album.images[2]?.url}
                alt={track.album.name}
                className="w-10 h-10 rounded"
              />
              <div className="text-left">
                <p className="font-medium">{track.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {track.artists.map(a => a.name).join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}