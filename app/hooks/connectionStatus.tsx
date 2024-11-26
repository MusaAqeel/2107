import { SupabaseClient, User } from "@supabase/supabase-js";

export async function SpotifyConnectionStatus(user: User, supabase: SupabaseClient) {

    const { data: spotifyConnection, error: connectionError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'spotify')
        .single();

    return { spotifyConnection, connectionError };
}