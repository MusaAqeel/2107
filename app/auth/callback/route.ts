import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // After successful email verification, redirect to complete profile
      return NextResponse.redirect(`${origin}/complete-profile`);
    }
  }

  // If there's an error or no code, redirect to sign in
  return NextResponse.redirect(`${origin}/sign-in`);
}
