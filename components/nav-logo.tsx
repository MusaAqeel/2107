'use client';

import {useTheme } from "next-themes";
import mixifyLogoDark from "@/app/logos/mixify-logo-bg-dark.png";
import mixifyLogoLight from "@/app/logos/mixify-logo-bg-light.png";
import Image from "next/image";

export default function ConnectSpotify() {
  const { theme } = useTheme();

  const LogoImage = () => {
    return (
        <>
        {theme === 'dark' ?(
            <Image
            src={mixifyLogoLight}
            alt="Light Mixify logo"
            width={40}
            height={40}
        />
        ) : (
            <Image
            src={mixifyLogoDark}
            alt="Dark Mixify logo"
            width={40}
            height={40}
        />
        )}
    </>
);
};

  return (
    <>
      {LogoImage()}
    </>
  );
} 