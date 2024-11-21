'use client';

import { FC } from 'react';

interface RefreshTokenButtonProps {
  userId: string;
}

const RefreshTokenButton: FC<RefreshTokenButtonProps> = ({ userId }) => {
  const refreshToken = async () => {
    const result = await fetch(`/api/spotify/refresh?userId=${userId}`);
    if (result.ok) {
      window.location.reload();
    }
  };

  return (
    <button
      onClick={refreshToken}
      className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Refresh Token
    </button>
  );
};

export default RefreshTokenButton; 