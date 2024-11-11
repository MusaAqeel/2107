'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpotifySearch } from './spotify-search';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

interface CreatePlaylistFormProps {
  accessToken: string;
}

export function CreatePlaylistForm({ accessToken }: CreatePlaylistFormProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleTrackSelect = (track: Track) => {
    if (!selectedTracks.find(t => t.id === track.id)) {
      setSelectedTracks(prev => [...prev, track]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim() || selectedTracks.length === 0) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          tracks: selectedTracks.map(track => track.id),
        }),
      });

      if (!response.ok) throw new Error('Failed to create playlist');

      // Reset form
      setPlaylistName('');
      setPlaylistDescription('');
      setSelectedTracks([]);
      window.location.reload(); // Refresh to show new playlist
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Playlist</CardTitle>
        <CardDescription>Add songs and create a custom playlist</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
          <Input
            placeholder="Playlist Description (optional)"
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Search and Add Songs</h3>
          <SpotifySearch
            accessToken={accessToken}
            onTrackSelect={handleTrackSelect}
          />
        </div>

        {selectedTracks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Songs</h3>
            <div className="space-y-2">
              {selectedTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={track.album.images[2]?.url}
                      alt={track.album.name}
                      className="w-10 h-10 rounded"
                    />
                    <div>
                      <p className="font-medium">{track.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrack(track.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCreatePlaylist}
          disabled={isCreating || !playlistName.trim() || selectedTracks.length === 0}
        >
          {isCreating ? 'Creating...' : 'Create Playlist'}
        </Button>
      </CardFooter>
    </Card>
  );
} 