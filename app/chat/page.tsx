"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';

interface UserConnection {
    user_id: string;
    provider: string;
    access_token: string;
}

const Chat = () => {
    const [user, setUser] = useState<User | null>(null);
    const [spotifyConnection, setSpotifyConnection] = useState<UserConnection | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                redirect('/sign-in');
            }
            setUser(user);

            // Get Spotify connection
            const { data: connection } = await supabase
                .from('user_connections')
                .select('*')
                .eq('user_id', user.id)
                .eq('provider', 'spotify')
                .single();
            
            setSpotifyConnection(connection);
        };

        checkAuth();
    }, []);

    const [inputValue, setInputValue] = useState<string>("");
    const [playlistLength, setPlaylistLength] = useState<number>(5);
    const [generating, setGenerating] = useState<boolean>(false);
    const [save, setSave] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [showInputAlert, setShowInputAlert] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue((event.target.value).substring(0,25));
    };

    const handlePlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistLength(parseInt(event.target.value));
    };

    const handlePromptSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setShowInputAlert(false);
        
        if (inputValue.trim() === "" || !spotifyConnection) {
            setShowInputAlert(true);
            return;
        }

        setGenerating(true);

        try {
            const response = await fetch("/api/python/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${spotifyConnection.access_token}`
                },
                body: JSON.stringify({
                    prompt: inputValue,
                    auth_token: spotifyConnection.access_token,
                    playlist_length: playlistLength
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Failed to generate recommendations');
            }

            setData({ recommendations: responseData });
            setShow(true);
        } catch (error) {
            console.error('Generation error:', error);
            if (error instanceof Response) {
                const text = await error.text();
                console.error('Error response:', text);
            }
            setShowInputAlert(true);
        } finally {
            setGenerating(false);
        }
    };

    const handlePlaylistSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!spotifyConnection || !data) return;
        setSave(true);

        try {
            const response = await fetch("/api/python/playlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${spotifyConnection.access_token}`
                },
                body: JSON.stringify({
                    track_ids: data.recommendations,
                    title: inputValue,
                    description: `Generated playlist based on: ${inputValue}`
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create playlist');
            }

            const playlistUrl = await response.text();
            window.open(playlistUrl, '_blank');
        } catch (error) {
            console.error('Playlist creation error:', error);
        }
    };

    return (
        <> 
            { !show ? (
            <div className={styles.container}>
            {/* <Image src="/waves.png" width="100" height="100" alt="image of some sound waves"></Image> */}
            <div className={styles.title}><h1>Mixify</h1></div>
                <form className={styles.form} data-testid='form' onSubmit={handlePromptSubmit}>
                    
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
                    <Button variant="outline" size="lg" type="submit" onClick={handlePromptSubmit} data-testid='submitButton'>
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
                                {data.recommendations.map((recommendation: any, index: number) => (
                                    <tr style={{padding: '10px'}} key={index}>
                                        <td style={{padding: '10px'}}>{recommendation.title}</td>
                                        <td style={{padding: '10px'}}>{recommendation.artist}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </AlertDescription>
                    </Alert>
                    <Button variant="outline" size="lg" type="submit" onClick={handlePlaylistSubmit} data-testid='saveButton'>
                        {save ? 'Saved!' : 'Save to Spotify'}
                    </Button>
                </div>
            )}
        </>
    );
}


export default Chat;