import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Information } from "@/components/ui/information";
import Link from "next/link";

interface SpotifyProfile {
  spotify_connected: boolean;
  spotify_display_name?: string;
  spotify_email?: string;
  updated_at?: string;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch user profile data including Spotify connection status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const spotifyProfile: SpotifyProfile = profile || { spotify_connected: false };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Profile Settings</h1>
      
      {searchParams.success === 'spotify_connected' && (
        <Information
          title="Success"
          message="Your Spotify account has been connected successfully!"
        />
      )}
      
      {searchParams.error && (
        <Information
          title="Error"
          message="Failed to connect your Spotify account. Please try again."
        />
      )}
      
      <div className="space-y-6">
        {/* User Info Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium">Account Information</h2>
          <div className="bg-card p-4 rounded-lg space-y-2">
            <p><span className="text-muted-foreground">Email:</span> {session.user.email}</p>
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {session.user.user_metadata?.full_name || "Not set"}
            </p>
          </div>
        </section>

        {/* Spotify Connection Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium">Spotify Connection</h2>
          
          {spotifyProfile.spotify_connected ? (
            <div className="space-y-4">
              <Information
                title="Connected to Spotify"
                message={`Logged in as ${spotifyProfile.spotify_display_name || 'Unknown'}`}
              />
              
              <div className="bg-card p-4 rounded-lg space-y-2">
                <p>
                  <span className="text-muted-foreground">Spotify Email:</span>{" "}
                  {spotifyProfile.spotify_email}
                </p>
                <p>
                  <span className="text-muted-foreground">Last Updated:</span>{" "}
                  {new Date(spotifyProfile.updated_at!).toLocaleDateString()}
                </p>
              </div>

              <form action="/api/spotify/auth">
                <Button 
                  type="submit"
                  variant="outline"
                  className="w-full"
                >
                  Reconnect Spotify
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <Information
                title="Not Connected"
                message="Connect your Spotify account to start creating AI-powered playlists."
              />
              
              <form action="/api/spotify/auth">
                <Button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760]"
                >
                  <SpotifyIcon className="w-5 h-5" />
                  Connect Spotify
                </Button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SpotifyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
      />
    </svg>
  );
}