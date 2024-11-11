'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks: {
    total: number;
  };
}

interface Props {
  playlists: Playlist[];
}

export function AnimatedPlaylistGrid({ playlists }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (!mounted) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {playlists.map((playlist) => (
        <motion.div
          key={playlist.id}
          variants={item}
          layoutId={playlist.id}
          className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <motion.img
            layoutId={`image-${playlist.id}`}
            src={playlist.images?.[0]?.url || '/playlist-placeholder.png'}
            alt={playlist.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
              {playlist.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {playlist.tracks.total} tracks
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
} 