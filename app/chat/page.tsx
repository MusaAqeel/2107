"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Chat = () => {
    const [inputValue, setInputValue] = useState<string>("");
    const [playlistLength, setPlaylistLength] = useState<number>(5);
    const [generating, setGenerating] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [showInputAlert, setShowInputAlert] = useState<boolean>(false);
    const [playlistUrl, setPlaylistUrl] = useState<string>("");
    const supabase = createClientComponentClient();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue((event.target.value).substring(0,25));
    };

    const handlePlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistLength(parseInt(event.target.value));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setShowInputAlert(false);
        
        if (inputValue.trim() === "") {
            setShowInputAlert(true);
            return;
        }

        try {
            setGenerating(true);
            
            // Get Spotify token from Supabase session
            const { data: { session } } = await supabase.auth.getSession();
            const spotifyToken = session?.provider_token;

            if (!spotifyToken) {
                console.error('No Spotify token in session');
                setShowInputAlert(true);
                return;
            }

            // First, search for tracks
            const searchUrl = `http://localhost:8000/api/spotify/search?query=${encodeURIComponent(inputValue)}&limit=${playlistLength}`;
            console.log('Making search request to:', searchUrl);
            
            const searchResponse = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${spotifyToken}`
                }
            });

            if (!searchResponse.ok) {
                const errorData = await searchResponse.text();
                console.error('Search failed:', errorData);
                throw new Error(`Search failed: ${errorData}`);
            }

            const trackIds = await searchResponse.json();
            console.log('Received track IDs:', trackIds);

            if (!trackIds || trackIds.length === 0) {
                throw new Error('No tracks found');
            }

            const createResponse = await fetch('http://localhost:8000/api/spotify/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${spotifyToken}`
                },
                body: JSON.stringify({
                    title: `Mixify: ${inputValue}`,
                    description: `Generated playlist for: ${inputValue}`,
                    request: trackIds
                })
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.text();
                console.error('Playlist creation failed:', errorData);
                throw new Error(`Playlist creation failed: ${errorData}`);
            }

            const data = await createResponse.json();
            setPlaylistUrl(data.playlist_url);
            setShow(true);

        } catch (error) {
            console.error('Error:', error);
            setShowInputAlert(true);
        } finally {
            setGenerating(false);
        }
    };

    const handleOpenSpotify = () => {
        if (playlistUrl) {
            window.open(playlistUrl, '_blank');
        }
    };

    return (
        <> 
            { !show ? (
                <div className={styles.container}>
                    <div className={styles.title}><h1>Mixify</h1></div>
                    <form className={styles.form} data-testid='form' onSubmit={handleSubmit}>
                        <h2>What can I help you with today?</h2>
                        <Input 
                            maxLength={25} 
                            data-testid='textInput' 
                            value={inputValue} 
                            onChange={handleInputChange}
                            placeholder="e.g., 'Workout mix' or 'Chill music'"
                        />
                        {showInputAlert && (
                            <Alert data-testid='invalidInputAlert'>
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Something went wrong. Please try again.
                                </AlertDescription>
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
                            {playlistLength}
                        </div>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            type="submit"
                            disabled={generating}
                            data-testid='submitButton'
                        >
                            {generating ? 'Generation in process' : 'Submit'}
                        </Button>
                    </form>
                </div> 
            ) : (
                <div className={styles.success}>
                    <Alert data-testid='alert'>
                        <AlertTitle>Playlist Created!</AlertTitle>
                        <AlertDescription>
                            Click below to open your playlist in Spotify
                        </AlertDescription>
                    </Alert>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={handleOpenSpotify}
                        data-testid='saveButton'
                    >
                        Open in Spotify
                    </Button>
                    {/* Display the URL for testing */}
                    <div className={styles.debugUrl}>
                        {playlistUrl && <p>Playlist URL: {playlistUrl}</p>}
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;