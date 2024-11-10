'use client';

export default function ConnectSpotify() {
  const handleConnect = () => {
    // Redirect to your Spotify auth endpoint
    window.location.href = '/api/spotify/auth';
  };

  return (
    <button
      onClick={handleConnect}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Connect Spotify
    </button>
  );
} 