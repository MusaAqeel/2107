"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

import Image from 'next/image';
import mixifyLogoDark from './logos/mixify-logo-dark.png';
import mixifyLogoLight from './logos/mixify-logo.png';
import mixifyCroppedDark from './logos/mixify-cropped-dark.png';
import { useTheme } from 'next-themes';

export default function Index() {
  const handleClick = (event: React.FormEvent) => {
      event.preventDefault();

  };
    
  const { theme } = useTheme();

    
    const MyImage = () => {
        return (
            <>
            {theme === 'light' ?(
                <Image
                src={mixifyLogoLight}
                alt="Light logo"
                width={500}
                height={500}
            />
            ) : (
                <Image
                src={mixifyCroppedDark}
                alt="Dark logo"
                width={500}
                height={500}
            />
            )}
        </>
    );
    };

  return (
    <> 
        <div className={styles.homeContainer}>
            <div className="logo">{MyImage()}</div>

            <div className={styles.homeText}>
                <p>Experience personalized music with Mixify, your AI DJ</p>
            </div>

            <div className={styles.homeButton}>
                <Button variant="outline" size="lg" type="submit" onClick={handleClick} data-testid="submitButton">
                    <Link href="/sign-in">Mix it up</Link>
                </Button>
            </div>
        </div>
    </>
  );
}
