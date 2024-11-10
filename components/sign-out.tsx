'use client';

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        router.push('/sign-in');
        router.refresh();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-600 hover:text-gray-900"
    >
      Sign out
    </button>
  );
} 