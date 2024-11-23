'use client';

import { FC, useState } from 'react';
import { toast } from 'sonner';

interface RefreshTokenButtonProps {
  userId: string;
}

const RefreshTokenButton: FC<RefreshTokenButtonProps> = ({ userId }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/spotify/refresh?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }
      
      toast.success('Token refreshed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh token');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={refreshToken}
      disabled={isRefreshing}
      className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isRefreshing ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing...
        </>
      ) : 'Refresh Token'}
    </button>
  );
};

export default RefreshTokenButton; 