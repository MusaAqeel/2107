'use client';

import { SpotifySearch } from './spotify-search';

interface SpotifySearchWrapperProps {
  accessToken: string;
}

export function SpotifySearchWrapper({ accessToken }: SpotifySearchWrapperProps) {
  const handleTrackSelect = async (track: any) => {
    console.log('Selected track:', track);
  };

  return (
    <SpotifySearch 
      accessToken={accessToken}
      onTrackSelect={handleTrackSelect}
    />
  );
} 