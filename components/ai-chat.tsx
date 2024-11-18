"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Information } from '@/components/ui/information';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  track_ids?: string[];
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input } as Message;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get Spotify token from your auth system
      const token = "YOUR_SPOTIFY_TOKEN"; // You'll need to implement this

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          auth_token: token 
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Add assistant message showing the recommendation
      const assistantMessage = { 
        role: 'assistant', 
        content: 'Here are some song recommendations for you!',
        track_ids: data.track_ids 
      } as Message;
      
      setMessages(prev => [...prev, assistantMessage]);
      setTrackIds(data.track_ids);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating recommendations.' 
      } as Message;
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!trackIds.length) return;
    
    try {
      const response = await fetch('/api/spotify/create?title=AI Generated&description=Created from chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackIds)
      });
      
      const playlist = await response.json();
      
      // Add success message
      const successMessage = {
        role: 'assistant',
        content: `Playlist created! You can find it here: ${playlist.playlist_url}`
      } as Message;
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error creating the playlist.'
      } as Message;
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-4">
      <Information
        title="AI Chat"
        message="Have a conversation with our AI assistant."
      />

      <div className="flex flex-col gap-4 h-[500px] overflow-y-auto p-4 border rounded-md">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
} 