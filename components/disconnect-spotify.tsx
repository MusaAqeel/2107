'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export default function DisconnectSpotify() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      const { data: existingConnection } = await supabase
        .from('user_connections')
        .select('*')
        .eq('provider', 'spotify')
        .single();

      if (!existingConnection) {
        toast.error('No Spotify connection found');
        return;
      }

      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('provider', 'spotify');

      if (error) throw error;

      toast.success('Successfully disconnected from Spotify');
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      toast.error('Failed to disconnect Spotify. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={isLoading}
      className="mt-4 inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Disconnecting...
        </>
      ) : (
        'Disconnect Spotify'
      )}
    </button>
  );
} 