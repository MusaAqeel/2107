'use client';

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DisconnectSpotify() {
  const router = useRouter();
  const supabase = createClient();

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('provider', 'spotify');

      if (error) {
        console.error('Error disconnecting Spotify:', error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      className="mt-4 text-sm text-red-600 hover:text-red-700"
    >
      Disconnect Account
    </button>
  );
} 