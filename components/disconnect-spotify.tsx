'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function DisconnectSpotify() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('provider', 'spotify');

      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
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
      {isLoading ? 'Disconnecting...' : 'Disconnect Spotify'}
    </button>
  );
} 