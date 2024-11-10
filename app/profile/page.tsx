import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { EditProfileForm } from '@/components/edit-profile-form'
import { SpotifyConnectButton } from '@/components/spotify-connect-button'

import { authOptions } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <EditProfileForm 
            initialName={session.user?.name || ''} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
          <SpotifyConnectButton />
        </div>
      </div>
    </div>
  )
} 