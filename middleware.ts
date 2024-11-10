import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Handle authentication session
  const authResponse = await updateSession(request);
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Redirect map for common misspellings and legacy routes
  const redirects = {
    '/profole': '/profile',
    '/login': '/sign-in',
  };

  // Check if the pathname needs to be redirected
  if (pathname in redirects) {
    const url = request.nextUrl.clone();
    url.pathname = redirects[pathname as keyof typeof redirects];
    return NextResponse.redirect(url);
  }

  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
