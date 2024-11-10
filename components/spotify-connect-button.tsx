'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FaSpotify } from 'react-icons/fa'

export function SpotifyConnectButton() {
  const [isConnected, setIsConnected] = useState(false)

  const handleSpotifyConnect = async () => {
    // TODO: Implement Spotify OAuth flow
    console.log('Connecting to Spotify...')
  }

  const handleSpotifyDisconnect = async () => {
    // TODO: Implement Spotify disconnect
    console.log('Disconnecting from Spotify...')
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaSpotify className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="font-medium">Spotify</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected 
                ? 'Connected to your Spotify account' 
                : 'Connect to share your music taste'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={isConnected ? handleSpotifyDisconnect : handleSpotifyConnect}
          variant={isConnected ? "destructive" : "default"}
          className={isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>

      {isConnected && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last synced: Just now
        </div>
      )}
    </div>
  )
} 