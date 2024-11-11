"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';
import { Input } from '@/components/ui/input';

const feedback = () => {
    return (
        <>        
            <div className={styles.container}>
            <div className={styles.title}><h1>Feedback</h1></div>
                <form className={styles.form} >
                    <Input data-testid="textInput"/>
                    <Button variant="outline" size="lg" type="submit" data-testid="submitButton">
                        Submit
                    </Button>
                </form>
            </div>
        </>
    )
}

export default feedback;