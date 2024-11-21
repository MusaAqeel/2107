import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { refreshAndStoreSpotifyToken } from '@/utils/spotify';
import { createClient } from "@/utils/supabase/server";
import { Toaster } from 'sonner';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mixify - Your AI DJ",
  description: "Experience personalized music with Mixify, your AI DJ",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
    }

    if (user) {
      const token = await refreshAndStoreSpotifyToken(user.id);
      console.log('Refreshed Spotify token:', token);
    }
  } catch (error) {
    console.error('Layout error:', error);
  }

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href="/">Mixify - Your AI DJ</Link>
                    <div className="flex items-center gap-2">
                      <Link 
                        href="/profile" 
                        className="text-sm text-foreground/60 hover:text-foreground"
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/playlist" 
                        className="text-sm text-foreground/60 hover:text-foreground"
                      >
                        Playlists
                      </Link>
                      <Link 
                        href="/" 
                        className="text-sm text-foreground/60 hover:text-foreground"
                      >
                        Home
                      </Link>
                    </div>
                  </div>
                  <HeaderAuth />
                </div>
              </nav>
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>

              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Made with ❤️ by{" "}
                  <a
                    href="https://github.com/MusaAqeel"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Mixify Team
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
