"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LLM from '../LLM/LLM';
import Image from 'next/image';

const Chat = () => {

    const [inputValue, setInputValue] = useState<string>("");
    const [playlistLength, setPlaylistLength] = useState<number>(5);
    const [generating, setGenerating] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [showInputAlert, setShowInputAlert] = useState<boolean>(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue((event.target.value).substring(0,25));
    };

    const handlePlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistLength(parseInt(event.target.value));
    };

    const handleSubmit = (event: React.FormEvent) => {
        
        event.preventDefault();

        
        setShowInputAlert(false);
        
        if (inputValue.trim() === "") {
            setShowInputAlert(true);
            return;
        }

        const submittedInput = inputValue; // store for LLM use
        const submittedPlaylistLength = playlistLength;

        setGenerating(true);

        LLM(submittedInput, submittedPlaylistLength);

        setTimeout(() => {
            setShow(true);
        }, 5000);
    };

    return (
        <> 
            { !show ? (
            <div className={styles.container}>
            <Image src="/waves.png" width="100" height="100" alt="image of some sound waves"></Image>
            <div className={styles.title}><h1>Mixify</h1></div>
                <form className={styles.form} data-testid='form' onSubmit={handleSubmit}>
                    
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
                    <Button variant="outline" size="lg" type="submit" onClick={handleSubmit} data-testid='submitButton'>
                        {generating ? 'Generation in process' : 'Submit'}
                    </Button>
                </form>
            </div> 
            ): (
            
            
                <div>
                    <Alert data-testid='alert'>
                        <AlertTitle>Playlist Created!</AlertTitle>
                        <AlertDescription>
                            You can now view your playlist on Spotify.
                        </AlertDescription>
                    </Alert>
                    <Button variant="outline" size="lg" type="submit" data-testid='saveButton'>
                        Save to Spotify
                    </Button>
                </div>
            )}
        </>
    );
}


export default Chat;