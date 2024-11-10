'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditProfileFormProps {
  initialName: string
}

export function EditProfileForm({ initialName }: EditProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateName = (name: string): string | null => {
    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      // TODO: Implement the update profile API call
      console.log('Updating profile:', { name });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Display Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          aria-describedby={error ? 'name-error' : undefined}
        />
        {error && (
          <p id="name-error" className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
      
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
} 