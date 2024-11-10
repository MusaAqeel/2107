'use client';

export default function ConnectSpotify() {
  return (
    <a
      href="/api/spotify/auth"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Connect Spotify
    </a>
  );
} 