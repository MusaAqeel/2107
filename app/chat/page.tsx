"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from "@/utils/supabase/client";
import Image from 'next/image';
import mixifyLogoDark from '../logos/mixify-logo-dark.png';
import mixifyLogoLight from '../logos/mixify-logo.png';
import { useTheme } from 'next-themes';

const Chat = () => {
    // User sets LLM Prompt and Playlist Length
    const [inputValue, setInputValue] = useState<string>("");
    const [playlistLength, setPlaylistLength] = useState<number>(5);

    // Page states
    const [generating, setGenerating] = useState<boolean>(false);
    const [savePlaylist, setSavePlaylist] = useState<boolean>(false);
    const [showLLMOutput, setShowLLMOutput] = useState<boolean>(false);
    const [showInputAlert, setShowInputAlert] = useState<boolean>(false);
    const [playlistURL, setPlaylistURL] = useState<string | undefined>(undefined);
    const [showLink, setShowLink] = useState<boolean>(false);

    // Handle Data, Error, and Access Token
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // User sets Spotify Playlist Name and Description
    const [playlistName, setPlaylistName] = useState<string>("Your Mixify Mix");
    const [playlistDescription, setPlaylistDescription] = useState<string>("A mix of songs generated by Mixify");
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue((event.target.value).substring(0,25));
    };

    const handlePlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistLength(parseInt(event.target.value));
    };

    const handlePlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistName(event.target.value);
    };

    const handlePlaylistDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistDescription((event.target.value).substring(0,300));
    };

    const { theme } = useTheme();

    const MyImage = () => {
        return (
            <>
            {theme === 'light' ?(
                <Image
                src={mixifyLogoLight}
                alt="My image"
                width={500}
                height={500}
              />
            ) : (
                <Image
                src={mixifyLogoDark}
                alt="My image"
                width={500}
                height={500}
              />
            )}
          </>
      );
    };
    
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

    useEffect(() => {
        if (!accessToken) {
          setError('No Spotify Account Connected');
        }
        else {
            setError(null);
        }
    }, [accessToken]);

    const handlePromptSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setShowInputAlert(false);
        
        if (inputValue.trim() === "") {
            setShowInputAlert(true);
            return;
        }

        setGenerating(true);

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: inputValue,
                auth_token: accessToken,
                playlist_length: playlistLength,
            }),
        });

        setData(await response.json());
        setShowLLMOutput(true);
    };

    const handlePlaylistSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSavePlaylist(true);

            const response = await fetch(
                `/api/playlist`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        track_ids: data.track_ids,
                        title: playlistName,
                        description: playlistDescription
                    }),
                }
            );
        setPlaylistURL( await response.json() );
        setShowLink(true);
    };

    return (
        <> 
            { !showLLMOutput ? (
            <div className={styles.container}>
            <div>{ MyImage() }</div>
                <form className={styles.form} data-testid='form'>
                    <h2>What can I help you with today?</h2>
                    <Input maxLength={25} data-testid='textInput' value={inputValue} onChange={handleInputChange}/>
                    {showInputAlert && (
                            <Alert data-testid='invalidInputAlert'>
                                <AlertTitle>Invalid Input</AlertTitle>
                                <AlertDescription>
                                    Please enter a valid input.
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
                    {error !== null && (
                        <div className="text-red-500 p-2 border border-red-300 rounded-md">
                        {error}
                        </div>
                    )}
                    <Button variant="outline" size="lg" type="submit" onClick={handlePromptSubmit} data-testid='submitButton' disabled={error !== null}>
                        {generating ? 'Generation in process' : 'Submit'}
                    </Button>
                </form>
            </div> 
            ): (        
                <div>
                    <Alert data-testid='alert'>
                        <AlertTitle>Playlist Created!</AlertTitle>
                        <AlertDescription>
                        <table>
                            <tbody>
                                {data.recommendations.recommendations.map((recommendation: any, index: number) => (
                                    <tr style={{padding: '10px'}} key={index}>
                                        <td style={{padding: '10px'}}>{recommendation.title}</td>
                                        <td style={{padding: '10px'}}>{recommendation.artist}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </AlertDescription>
                    </Alert>
                    {showLink ? (                    
                        <Alert data-testid='alert'>
                            <a href={playlistURL?.replace(/["']/g, '')} target="_blank" rel="noopener noreferrer">
                                Link to playlist
                            </a>
                        </Alert>
                    ) : null
                    }
                    {!savePlaylist && (
                        <>
                            <Input data-testid='playlistNameInput' value={playlistName} onChange={handlePlaylistNameChange} />
                            <Input maxLength={300} data-testid='playlistDescriptionInput' value={playlistDescription} onChange={handlePlaylistDescriptionChange} />
                        </>
                    )}
                    <Button variant="outline" size="lg" type="submit" onClick={handlePlaylistSubmit} data-testid='saveButton' disabled={savePlaylist}>
                        {savePlaylist ? 'Saved!' : 'Save to Spotify'}
                    </Button>
                </div>
            )}
        </>
    );
}

export default Chat;