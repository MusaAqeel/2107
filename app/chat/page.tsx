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

        const response = await fetch("http://127.0.0.1:8000/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: inputValue,
                auth_token: spotifyConnection.access_token,
            }),
        });

        setData(await response.json());
        setShow(true);
    };

    const handlePlaylistSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!spotifyConnection) return;
        setSave(true);

        const response = await fetch("http://127.0.0.1:8000/api/playlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: inputValue,
                auth_token: spotifyConnection.access_token,
            }),
        });

        setData(await response.json());
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
                    <Button variant="outline" size="lg" type="submit" onClick={handlePlaylistSubmit} data-testid='saveButton'>
                        {save ? 'Saved!' : 'Save to Spotify'}
                    </Button>
                </div>
            )}
        </>
    );
}


export default Chat;