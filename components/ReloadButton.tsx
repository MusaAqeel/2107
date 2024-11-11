'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ReloadButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReload = () => {
    setIsLoading(true);
    // Force a complete refresh of the page
    window.location.reload();
  };

  return (
    <button
      onClick={handleReload}
      disabled={isLoading}
      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50"
    >
      <svg 
        className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
      {isLoading ? 'Reloading...' : 'Reload'}
    </button>
  );
} 