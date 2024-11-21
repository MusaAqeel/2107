"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SpotifySession extends Session {
  accessToken?: string;
  error?: string;
}

const Chat = () => {
    const { data: session } = useSession() as { data: SpotifySession | null };
    
    const [inputValue, setInputValue] = useState<string>("");
    const [playlistLength, setPlaylistLength] = useState<number>(5);
    const [generating, setGenerating] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [showInputAlert, setShowInputAlert] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [playlistUrl, setPlaylistUrl] = useState<string>("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue((event.target.value).substring(0, 25));
    };

    const handlePlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistLength(parseInt(event.target.value));
    };

    const generatePlaylist = async (prompt: string, accessToken: string) => {
        try {
            // First, get song recommendations from AI
            const recommendationsResponse = await fetch('/api/ai-chat/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    auth_token: accessToken
                })
            });

            if (!recommendationsResponse.ok) {
                throw new Error('Failed to generate recommendations');
            }

            const trackIds = await recommendationsResponse.json();

            // Then create the playlist with the recommended tracks
            const createPlaylistResponse = await fetch('/api/spotify/create-playlist', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    track_ids: trackIds,
                    title: `Mixify: ${prompt}`,
                    description: `Generated playlist based on: ${prompt}`
                })
            });

            if (!createPlaylistResponse.ok) {
                throw new Error('Failed to create playlist');
            }

            const playlist = await createPlaylistResponse.json();
            return playlist.playlist_url;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setShowInputAlert(false);
        
        if (inputValue.trim() === "") {
            setShowInputAlert(true);
            return;
        }

        if (!session?.accessToken) {
            setError("Please login with Spotify first");
            return;
        }

        setGenerating(true);

        try {
            const url = await generatePlaylist(inputValue, session.accessToken);
            setPlaylistUrl(url);
            setShow(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create playlist');
        } finally {
            setGenerating(false);
        }
    };

    const openPlaylist = () => {
        if (playlistUrl) {
            window.open(playlistUrl, '_blank');
        }
    };

    return (
        <> 
            {!show ? (
                <div className={styles.container}>
                    <Image src="/waves.png" width={100} height={100} alt="image of some sound waves" />
                    <div className={styles.title}><h1>Mixify</h1></div>
                    <form className={styles.form} data-testid='form' onSubmit={handleSubmit}>
                        <h2>What can I help you with today?</h2>
                        <Input 
                            maxLength={25} 
                            data-testid='textInput' 
                            value={inputValue} 
                            onChange={handleInputChange}
                            placeholder="e.g., Happy summer vibes"
                        />
                        
                        {showInputAlert && (
                            <Alert variant="destructive" data-testid='invalidInputAlert'>
                                <AlertTitle>Invalid Input</AlertTitle>
                                <AlertDescription>
                                    Please enter a valid input.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className={styles.slider}>
                            <h2>Choose your playlist length:</h2>
                            <input
                                type="range"
                                min="1"
                                max="25"
                                value={playlistLength}
                                onChange={handlePlaylistLengthChange}
                                data-testid='sliderInput'
                            />
                            <span>{playlistLength} songs</span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="lg" 
                            type="submit" 
                            disabled={generating} 
                            data-testid='submitButton'
                        >
                            {generating ? 'Generating playlist...' : 'Create Playlist'}
                        </Button>
                    </form>
                </div> 
            ) : (
                <div className={styles.successContainer}>
                    <Alert variant="default" data-testid='alert'>
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            Your playlist has been created successfully.
                        </AlertDescription>
                    </Alert>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={openPlaylist} 
                        data-testid='openSpotifyButton'
                        className={styles.spotifyButton}
                    >
                        Open in Spotify
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        onClick={() => {
                            setShow(false);
                            setInputValue("");
                            setGenerating(false);
                        }} 
                        data-testid='createAnotherButton'
                    >
                        Create Another Playlist
                    </Button>
                </div>
            )}
        </>
    );
};

export default Chat;